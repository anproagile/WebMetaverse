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
            host: 'localhost',
            port: 7070,
            peerjspath: '/peerjs',
            apipath: '/connectedpeers'
        }
    }


    joinRoom() {
        this.pollConnectedPeers(this.connect);
    }

    connect = (peers) => {
        

        var id = this.generateId();
        console.log("Connecting with id " + id + ", available peers: " + peers);
        this.localPeer = new Peer(id, { host: this.server.host, port: this.server.port, path: this.server.peerjspath, debug: 3 });
        

        this.localPeer.on('error', function (err) {
            console.log(err);
        })

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
    peer: Peer;
    id : string;

    connect() {
        //this.peer;

    }

}