/// <reference path="../typings/peerjs/Peer.d.ts"/>
/// <reference path="../typings/threejs/three.d.ts"/>

/// <reference path="networkclient.ts"/>
/// <reference path="networkplayer.ts"/>
/// <reference path="../room.ts"/>
module WM.Network {

    export class P2PNetworkClient {

        connections: { [id: string]: NetworkPlayer };
        networkClient: NetworkClient;

        get room(): Room {
            return this.networkClient.room;
        }
        get localPeer(): Peer {
            return this.networkClient.localPeer;
        }



        constructor(networkClient: NetworkClient) {
            this.networkClient = networkClient;
            this.connections = {};
        }

        init() {
            this.localPeer.on('connection', (connection) => {
                console.log("Incoming " + (connection.reliable?"reliable":"unreliable")+ " connection from " + connection.peer);
                this.onConnectionToPeerCreate(connection);
            });
        }


        broadcastMessage(msg: string) {
            console.log('Broadcasting message "' + msg + '"');
            for (var id in this.connections) {
                this.connections[id].sendChatMessage(msg);
            }
        }

        broadcastMessageUnreliably(msg: string) {
            console.log('Broadcasting message "' + msg + '"');
            for (var id in this.connections) {
                this.connections[id].sendChatMessageUnreliable(msg);
            }
        }


        chat = (msg) => { this.broadcastMessage(msg) };

        broadcastPosition(pos: THREE.Vector3, yRotation: number) {

            for (var id in this.connections) {
                this.connections[id].sendPosition(pos, yRotation);
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
                //Create a new networkplayer, give it shape and add it to the shene.
                var player = new NetworkPlayer(connection);
                this.connections[connection.peer] = player;

                var mesh = new THREE.Mesh(new THREE.BoxGeometry(8, 16, 8));
                player.mesh = mesh;
                this.room.add(mesh);

                //After reliable connection has been made, create an unreliable one.
                this.connectToPeerUnreliable(connection.peer);
            }
            else {
                this.connections[connection.peer].addUnreliableConnection(connection);
            }
            

        }

        private onConnectionClosed = (connection: PeerJs.DataConnection) => {
            console.log((connection.reliable ? "Reliable" : "Unreliable") + " connection closed to " + connection.peer);

            if (this.connections[connection.peer]) {
                if (connection.reliable) {
                    this.room.scene.remove(this.connections[connection.peer].mesh);
                    delete this.connections[connection.peer];
                }
            }
        }

    }
}