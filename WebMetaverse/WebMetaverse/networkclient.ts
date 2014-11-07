/// <reference path="Scripts/typings/peerjs/Peer.d.ts"/>

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

    connect = (peers) => {
        

        var id = this.generateId();
        console.log("Connecting with id " + id + ", available peers: " + peers);
        this.localPeer = new Peer(id, { host: this.server.host, port: this.server.port, path: this.server.peerjspath, debug: 3 });

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
            console.log("Establishing connection to peer " + peers[i]);
            var connection = this.localPeer.connect(peers[i]);
            this.onConnectionToPeerCreate(connection);
        }
    } 


    onConnectionToPeerCreate = (connection: PeerJs.DataConnection) => {
        connection.on('open', () => this.onConnectionEstablished(connection));
    }

    onConnectionEstablished = (connection: PeerJs.DataConnection) => {
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

    constructor(connection) {
        this.connection = connection;
    }


}