/// <reference path="Scripts/typings/peerjs/Peer.d.ts"/>
/// <reference path="Scripts/typings/threejs/three.d.ts"/>

interface WMServer {
    host: string;
    port: number;
    peerjspath: string;
    apipath: string;
}



class NetworkClient {

    server: WMServer;
    localPeer: Peer;
    room: Room;
    p2p: P2PNetworkClient;


    constructor() {
        this.server = {
            host: 'webvr.rocks',
            port: 7170,
            peerjspath: '/peerjs',
            apipath: '/connectedpeers'
        }
        this.p2p = new P2PNetworkClient(this);
    }


    joinRoom() {
        this.pollConnectedPeers(this.connect);
    }

    connect = (peers) => {
        
        var id = this.generateId();
        console.log("Connecting with id " + id + ", available peers: " + peers);

        this.localPeer = new Peer(id, { host: this.server.host, port: this.server.port, path: this.server.peerjspath});
        

        window.onunload = window.onbeforeunload = (e) => {
            if (!!this.localPeer && !this.localPeer.destroyed) {
                this.localPeer.destroy();
            }
            if (!!this.p2p.localPeer && !this.p2p.localPeer.destroyed) {
                this.p2p.localPeer.destroy();
            }
        }

        this.localPeer.on('open', this.onConnectedToServer);
        this.localPeer.on('error', function (err) {
            console.log(err);
        });

        this.p2p.init();
        this.p2p.connectToPeers(peers);

    }

    private onConnectedToServer = (id) => {
        console.log("Connected to central server with ID: " + id);
    }

    private onDisconnectedFromServer = () => {
        console.log("Disconnected from central server");
    }

    generateId (): string {
        return Math.random().toString(36).substring(7);
    }

    pollConnectedPeers(callback) {
        var url = 'http://' + this.server.host + ':' + this.server.port + this.server.apipath + '?callback=?';
        this.getJSONP(url, callback);
    }

    getJSONP(url, success) {

        var ud = '_' + +new Date,
            script = document.createElement('script'),
            head = document.getElementsByTagName('head')[0]
            || document.documentElement;

        window[ud] = function (data) {
            console.log("awroo!");
            head.removeChild(script);
            success && success(data);
        };

        script.src = url.replace('callback=?', 'callback=' + ud);
        head.appendChild(script);
    }

}

class P2PNetworkClient {

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



class NetworkPlayer {
    connection: PeerJs.DataConnection;
    reliableConnection: PeerJs.DataConnection;
    mesh: THREE.Mesh;

    constructor(connection: PeerJs.DataConnection) {
        this.connection = connection;
        connection.on('data', (data) => this.onReceive(data, connection.peer));
    }

    onReceive(data: any, fromId: string) {
        if (data.type == 'chat') {
            console.log('Received chat "' + data.msg + '" from ' + fromId);
        }
        else if (data.type == 'pos') {
            if (this.mesh) {
                this.mesh.position.set(data.x, data.y, data.z);
            }
        }
    }

    sendChatMessage(message: string) {
        this.connection.send({ type: 'chat', msg: message });
    }

    sendPosition(pos : THREE.Vector3) {
        this.connection.send({ type: 'pos', x: pos.x, y: pos.y, z: pos.z });
    }
}