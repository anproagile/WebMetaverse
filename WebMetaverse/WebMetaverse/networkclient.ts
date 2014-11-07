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
    connections: NetworkPlayer[];
    localPeer: Peer;

    constructor() {
        this.server = {
            host: 'webvr.rocks',
            port: 7170,
            peerjspath: '/peerjs',
            apipath: '/connectedpeers'
        }
        this.connections = [];
    }


    joinRoom() {
        this.pollConnectedPeers(this.connect);
    }

    broadCastMessage(msg: string) {
        for (var i = 0; i < this.connections.length; i++) {
            this.connections[i].sendChatMessage(msg);
        }
    }

    broadCastPosition(pos: THREE.Vector3) {
        for (var i = 0; i < this.connections.length; i++) {
            this.connections[i].sendPosition(pos);
        }
    }


    connect = (peers) => {
        

        var id = this.generateId();
        console.log("Connecting with id " + id + ", available peers: " + peers);
        this.localPeer = new Peer(id, { host: this.server.host, port: this.server.port, path: this.server.peerjspath});

        window.onunload = window.onbeforeunload = (e) => {
            if (!!this.localPeer && !this.localPeer.destroyed) {
                this.localPeer.destroy();
            }
        }

        this.localPeer.on('open', this.onConnectedToServer);
        this.localPeer.on('connection', (connection) => {
            console.log("Incoming connection from " + connection.peer);
            this.onConnectionToPeerCreate(connection);
        });
        this.localPeer.on('error', function (err) {
            console.log(err);
        })

        this.connectToAllPeers(peers);

    }

    connectToAllPeers = (peers) => {
        
        for (var i = 0; i < peers.length; i++) {
            this.connectToPeer(peers[i]);
        }
    } 

    connectToPeer(id: string) {
        console.log("Establishing connection to peer " + id);
        var connection = this.localPeer.connect(id);
        this.onConnectionToPeerCreate(connection);
    }




    onConnectionToPeerCreate = (connection: PeerJs.DataConnection) => {
        connection.on('open', () => this.onConnectionEstablished(connection));
    }

    onConnectionEstablished = (connection: PeerJs.DataConnection) => {
        console.log("Connection established to " + connection.peer);
        connection.on('close', () => this.onConnectionClosed(connection));
        var player = new NetworkPlayer(connection);
        this.connections.push(player);
    }

    onConnectionClosed = (connection: PeerJs.DataConnection) => {
        console.log("Connection closed to " + connection.peer);
        if (this.connections[connection.peer]) {
            this.connections[connection.peer] = null;
        }
    }
    
    onConnectedToServer = (id) => {
        console.log("Connected to central server with ID: " + id);
    }

    onDisconnectedFromServer = () => {
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


class NetworkPlayer {
    connection: PeerJs.DataConnection;
    mesh: THREE.Mesh;

    constructor(connection: PeerJs.DataConnection) {
        this.connection = connection;
        connection.on('data', (data) => this.onReceive(data, connection.peer));
    }

    onReceive(data: any, fromId: string) {
        if (data.type == 'chat') {
            console.log('Received message "' + data.msg + '" from ' + fromId);
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