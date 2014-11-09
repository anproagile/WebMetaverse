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
            });
        }


        get room(): Room {
            return this.networkClient.room;
        }
        get localPeer(): Peer {
            return this.networkClient.localPeer;
        }

        public onNewConnection: Events.I1ArgsEvent<NetworkConnection> = new Events.TypedEvent();
        public onNewUnreliableConnection: Events.I1ArgsEvent<NetworkConnection> = new Events.TypedEvent();
        public onConnectionClose: Events.I2ArgsEvent<NetworkConnection, boolean> = new Events.TypedEvent();




        constructor(networkClient: NetworkClient) {
            this.networkClient = networkClient;
            this.connections = {};
            this.temp();
        }

        init() {
            this.localPeer.on('connection', (connection) => {
                console.log("Incoming " + (connection.reliable?"reliable":"unreliable")+ " connection from " + connection.peer);
                this.onConnectionToPeerCreate(connection);
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
                console.log("Connecting reliably");
                this.connectToPeerReliable(peers[i]);
            }
        }

        connectToPeerReliable(id: string) {
            console.log("Establishing reliable connection to peer " + id);
            var connection = this.localPeer.connect(id, { reliable: true,  });
            this.onConnectionToPeerCreate(connection);
        }
        connectToPeerUnreliable(id: string) {
            console.log("Establishing unreliable connection to peer " + id);
            var connection = this.localPeer.connect(id, { reliable: false });
            this.onConnectionToPeerCreate(connection);
        }


        private onConnectionToPeerCreate = (connection: PeerJs.DataConnection) => {
            connection.on('open', () => this.onConnectionEstablished(connection));
        }

        private onConnectionEstablished = (connection: PeerJs.DataConnection) => {
            console.log((connection.reliable ? "Reliable" : "Unreliable") + " connection established to " + connection.peer);
            connection.on('close', () => this.onConnectionClosed(connection));

            if (connection.reliable) {
                //Create a new networkplayer.
                var player = new NetworkConnection(connection);
                this.connections[connection.peer] = player;

                this.onNewConnection.trigger(player);

                //After reliable connection has been made, create an unreliable one.
                this.connectToPeerUnreliable(connection.peer);
            }
            else {
                //Hack for dual unreliable connection in Chrome..
                if (this.connections[connection.peer].unreliableConnection && this.connections[connection.peer].unreliableConnection.open) {
                    console.warn("Discarding second, faulty unreliable connection");
                    return;
                }


                this.connections[connection.peer].addUnreliableConnection(connection);
                
                this.onNewUnreliableConnection.trigger(this.connections[connection.peer]);
            }
            

        }

        private onConnectionClosed = (connection: PeerJs.DataConnection) => {
            console.log((connection.reliable ? "Reliable" : "Unreliable") + " connection closed to " + connection.peer);
            

            if (this.connections[connection.peer]) {

                this.onConnectionClose.trigger(this.connections[connection.peer], connection.reliable);

                if (connection.reliable) {
                    this.connections[connection.peer].destroy();
                    delete this.connections[connection.peer];
                }

            }
        }

    }
}