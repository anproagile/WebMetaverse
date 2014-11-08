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
                console.log("Incoming connection from " + connection.peer);
                this.onConnectionToPeerCreate(connection);
            });
        }


        broadcastMessage(msg: string) {
            console.log('Broadcasting message "' + msg + '"');
            for (var id in this.connections) {
                this.connections[id].sendChatMessage(msg);
            }
        }

        chat = (msg) => { this.broadcastMessage(msg) };

        broadcastPosition(pos: THREE.Vector3) {

            for (var id in this.connections) {
                this.connections[id].sendPosition(pos);
            }
        }


        connectToPeers = (peers) => {

            for (var i = 0; i < peers.length; i++) {
                this.connectToPeer(peers[i]);
            }
        }

    connectToPeer(id: string) {
            console.log("Establishing connection to peer " + id);
            var connection = this.localPeer.connect(id);
            this.onConnectionToPeerCreate(connection);
        }

    private onConnectionToPeerCreate = (connection: PeerJs.DataConnection) => {
            connection.on('open', () => this.onConnectionEstablished(connection));
        }

    private onConnectionEstablished = (connection: PeerJs.DataConnection) => {
            console.log("Connection established to " + connection.peer);
            connection.on('close', () => this.onConnectionClosed(connection));

            var player = new NetworkPlayer(connection);

            this.connections[connection.peer] = player;

            var mesh = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16));
            player.mesh = mesh;
            this.room.add(mesh);

        }

    private onConnectionClosed = (connection: PeerJs.DataConnection) => {
            console.log("Connection closed to " + connection.peer);
            if (this.connections[connection.peer]) {
                this.room.scene.remove(this.connections[connection.peer].mesh);
                delete this.connections[connection.peer];
            }
        }

    }
}