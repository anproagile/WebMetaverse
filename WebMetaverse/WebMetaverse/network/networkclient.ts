/// <reference path="../typings/peerjs/Peer.d.ts"/>
/// <reference path="../typings/threejs/three.d.ts"/>

/// <reference path="p2pnetworkclient.ts"/>
/// <reference path="../room.ts"/>
module WM.Network {


    export interface WMServer {
        host: string;
        port: number;
        peerjspath: string;
        apipath: string;
    }

    export class NetworkClient {

        server: WMServer;
        localPeer: Peer;
        room: Room;
        p2p: WM.Network.P2PNetworkClient;


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

            var ice = [
                { 'url': 'stun4:stun.l.google.com:19302' },
                { 'url': 'stun:stun.l.google.com:19302' },
                { 'url': 'stun.stunprotocol.org' },
                { 'url': 'stunserver.org' }
            ]


            this.localPeer = new Peer(id, { host: this.server.host, port: this.server.port, path: this.server.peerjspath, iceServers: ice/*, debug: 3 */});


            window.onunload = window.onbeforeunload = (e) => {
                if (!!this.localPeer && !this.localPeer.destroyed) {
                    this.localPeer.destroy();
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

        generateId(): string {
                return Math.random().toString(36).substring(7);
            }

        pollConnectedPeers(callback) {
            var url = 'http://' + this.server.host + ':' + this.server.port + this.server.apipath + '?callback=?';
            WM.Network.Util.getJSONP(url, callback);
        }
    }
}

module WM.Network.Util {
    export function getJSONP(url, success) {

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
