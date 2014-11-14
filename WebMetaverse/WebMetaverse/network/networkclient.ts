/// <reference path="../typings/peerjs/Peer.d.ts"/>
/// <reference path="../typings/threejs/three.d.ts"/>
/// <reference path="../typings/minilog/Minilog.d.ts"/>

/// <reference path="chatclient.ts"/>
/// <reference path="p2pnetworkclient.ts"/>

module WM.Network {

    export var mlog = Minilog('WM.Network');
    Minilog.suggest.deny('WM.Network', 'warn');
    Minilog.enable();

    export interface WMServer {
        host: string;
        port: number;
        peerjspath: string;
        apipath: string;
    }

    export class NetworkClient {

        server: WMServer;
        localPeer: Peer;
        p2p: WM.Network.P2PNetworkClient;
        chat: WM.Network.ChatClient;


        constructor() {
            this.server = {
                host: 'webvr.rocks',
                port: 7170,
                peerjspath: '/peerjs',
                apipath: '/connectedpeers'
            }
            this.p2p = new P2PNetworkClient(this);
            this.chat = new ChatClient(this.p2p);
        }


        joinRoom() {
            this.pollConnectedPeers(this.connect);
        }

        connect = (peers) => {

            var id = this.generateId();
            mlog.log("Connecting with id " + id + ", available peers: " + peers);

            var ice = [
                { 'url': 'stun4:stun.l.google.com:19302' },
                { 'url': 'stun:stun.l.google.com:19302' },
                { 'url': 'stun.stunprotocol.org:3478' },
                { 'url': 'stunserver.org' },
                { 'url': "stun.voipbuster.com"},
                { 'url': "stun.voipstunt.com" },
                { 'url': "stun.voxgratia.org" }
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
                mlog.log("Connected to central server with ID: " + id);
            }

        private onDisconnectedFromServer = () => {
                mlog.log("Disconnected from central server");
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
            head.removeChild(script);
            success && success(data);
        };

        script.src = url.replace('callback=?', 'callback=' + ud);
        head.appendChild(script);
    }

}
