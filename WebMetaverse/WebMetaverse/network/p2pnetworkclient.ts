/// <reference path="../typings/peerjs/Peer.d.ts"/>
/// <reference path="../typings/threejs/three.d.ts"/>

/// <reference path="networkclient.ts"/>
/// <reference path="networkconnection.ts"/>
/// <reference path="networkedmesh.ts"/>
/// <reference path="../event/event.ts"/>
module WM.Network {

    export class P2PNetworkClient {

        connections: { [id: string]: NetworkConnection };
        networkClient: NetworkClient;

        avatars: NetworkedMesh[];

        get room(): Room {
            return this.networkClient.room;
        }
        get localPeer(): Peer {
            return this.networkClient.localPeer;
        }

        public onNewConnection: Events.I1ArgsEvent<NetworkConnection> = new Events.TypedEvent();
        public onNewUnreliableConnection: Events.I1ArgsEvent<NetworkConnection> = new Events.TypedEvent();
        public onConnectionClose: Events.I1ArgsEvent<NetworkConnection> = new Events.TypedEvent();

        public onReceive: Events.I2ArgsEvent<any, NetworkConnection> = new Events.TypedEvent();


        constructor(networkClient: NetworkClient) {
            this.networkClient = networkClient;
            this.connections = {};
            this.temp();
        }

        init() {
            this.localPeer.on('connection', (connection) => {
                mlog.log("Incoming " + (connection.reliable?"reliable":"unreliable")+ " connection from " + connection.peer);
                this.onConnectionToPeerCreate(connection);
            });

        }

        update() {
            for (var i = 0; i < this.avatars.length; i++) {
                this.avatars[i].update();
            }
        }

        temp() {
            this.avatars = [];
            this.onNewUnreliableConnection.add((con) => {
                var ava = new NetworkedMesh(new THREE.Mesh(new THREE.BoxGeometry(8, 16, 8)));
                this.avatars.push(ava);
                con.onReceiveUnreliable.add((msg) => ava.receivePosition(msg));
                this.room.add(ava.mesh);

                con.onDestroy.add(() => {
                    var index = this.avatars.indexOf(ava);
                    if (index > -1) {
                        this.avatars.splice(index, 1);
                    }
                    this.room.scene.remove(ava.mesh);
                });

            });
        }



        broadcastReliable(data: any) {
            for (var id in this.connections) {
                this.connections[id].sendReliable(data);
            }
        }

        broadcastUnreliable(data: any) {
            for (var id in this.connections) {
                this.connections[id].sendUnreliable(data);
            }
        }

        connectToPeers = (peers) => {

            for (var i = 0; i < peers.length; i++) {
                mlog.log("Connecting reliably to all peers");
                this.connectToPeerReliable(peers[i]);
            }
        }

        connectToPeerReliable(id: string) {
            mlog.log("Establishing reliable connection to peer " + id);
            var connection = this.localPeer.connect(id, { reliable: true,  });
            this.onConnectionToPeerCreate(connection);
        }
        connectToPeerUnreliable(id: string) {
            mlog.log("Establishing unreliable connection to peer " + id);
            var connection = this.localPeer.connect(id, { reliable: false });
            this.onConnectionToPeerCreate(connection);
        }


        private onConnectionToPeerCreate = (connection: PeerJs.DataConnection) => {
            connection.on('open', () => this.onConnectionEstablished(connection));
        }

        private onConnectionEstablished = (connection: PeerJs.DataConnection) => {
            mlog.log((connection.reliable ? "Reliable" : "Unreliable") + " connection established to " + connection.peer);
            connection.on('close', () => this.onConnectionClosed(connection));

            var networkConnection;

            if (connection.reliable) {
                //Create a new network connection wrapper.
                networkConnection = new NetworkConnection(connection);
                this.connections[connection.peer] = networkConnection;

                this.onNewConnection.trigger(networkConnection);

                //After reliable connection has been made, create an unreliable one.
                this.connectToPeerUnreliable(connection.peer);
            }
            else {
                //Hack for dual unreliable connection in Chrome (scratch that, also in FF, PeerJS faulty?)
                if (this.connections[connection.peer].unreliableConnection && this.connections[connection.peer].unreliableConnection.open) {
                    mlog.warn("Discarding second, faulty unreliable connection, thank you Obama");
                    return;
                }
                networkConnection = this.connections[connection.peer];
                networkConnection.addUnreliableConnection(connection);
                this.onNewUnreliableConnection.trigger(networkConnection);
            }

            connection.on('data', (data) => this.onReceive.trigger(data, networkConnection));

        }



        private onConnectionClosed = (connection: PeerJs.DataConnection) => {
            mlog.log((connection.reliable ? "Reliable" : "Unreliable") + " connection closed to " + connection.peer);
            

            if (this.connections[connection.peer]) {

                this.onConnectionClose.trigger(this.connections[connection.peer]);

                if (connection.reliable) {
                    this.connections[connection.peer].destroy();
                    delete this.connections[connection.peer];
                }

            }
        }

    }

}