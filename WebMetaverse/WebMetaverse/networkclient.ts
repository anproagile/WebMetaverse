/// <reference path="Scripts/typings/peerjs/Peer.d.ts"/>

class NetworkClient {

    connections: NetworkPlayer[];
    peer: Peer;

    joinRoom() {
        this.pollConnectedPeers(this.connect);
    }

    connect = (peers) => {

        var id = this.generateId();
        console.log("Connecting with id " + id + ", available peers: " + peers);
        this.peer = new Peer(id, { host: 'localhost', port: 7070, path: '/peerjs', debug: 3 });
        /*
        peer.on('error', function (err) {
            console.log(err);
        })*/
    }


    generateId (): string {
        return Math.random().toString(36).substring(7);
    }

    pollConnectedPeers(callback) {
        this.getJSONP("http://localhost:7070/connectedpeers?callback=?", callback);
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