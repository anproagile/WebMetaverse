/// <reference path="../typings/threejs/three.d.ts"/>
/// <reference path="../typings/minilog/Minilog.d.ts"/>

/// <reference path="chatclient.ts"/>
/// <reference path="p2pnetworkclient.ts"/>
/// <reference path="../typings/excess/excess.d.ts" />

module wm.network {

    export var mlog = Minilog('WM.Network');
    Minilog.suggest.deny('WM.Network', 'warn');
    Minilog.enable();

    export interface Server {
        host: string;
        port: number;
        apipath: string;
    }

    export class NetworkClient {

        server: Server;

        excess: excess.ExcessClient;
        p2p: wm.network.P2PNetworkClient;
        chat: wm.network.ChatClient;

        localId: string;

        constructor() {
            this.server = {
                host: 'localhost',
                port: 4000,
                apipath: '/excess',
            }
            this.p2p = new P2PNetworkClient(this);
            this.chat = new ChatClient(this.p2p);

            this.localId = this.generateId();
        }


        joinRoom() {
            
        }

        connect = (peers) => {

            var id = this.localId;

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

            var endPoint: string = '//' + this.server.host + ':' + this.server.port + this.server.apipath;

            this.excess = new excess.ExcessClient(endPoint, id, ice);


            window.onunload = window.onbeforeunload = (e) => {
                if (!!this.excess/* && !this.excess.destroyed*/) {
                    //TODO attempt to destroy excess gracefully
                }
            }

            this.p2p.init();
            this.p2p.connectToPeers(peers);

            this.excess.connectToServer().then(
                () => {
                    console.log("Connected to signalling server!");
                },
                () => {
                    console.log("Failed to connect to signalling server!");
                }
                );


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

    }
}