/// <reference path="../typings/peerjs/Peer.d.ts"/>
/// <reference path="../typings/threejs/three.d.ts"/>

/// <reference path="networkclient.ts"/>
/// <reference path="networkconnection.ts"/>
/// <reference path="networkedmesh.ts"/>
/// <reference path="../event/event.ts"/>

var nc;

module wm.network {

    export class P2PNetworkClient {

        connections: { [id: string]: NetworkConnection };
        networkClient: NetworkClient;


        get localPeer(): Peer {
            return this.networkClient.localPeer;
        }

        public onNewConnection: events.I1ArgsEvent<NetworkConnection> = new events.TypedEvent();
        public onNewUnreliableConnection: events.I1ArgsEvent<NetworkConnection> = new events.TypedEvent();
        public onConnectionClose: events.I1ArgsEvent<NetworkConnection> = new events.TypedEvent();

        public onReceiveReliable: events.I2ArgsEvent<any, NetworkConnection> = new events.TypedEvent();
        public onReceiveUnreliable: events.I2ArgsEvent<any, NetworkConnection> = new events.TypedEvent();

        constructor(networkClient: NetworkClient) {
            this.networkClient = networkClient;
            this.connections = {};

        }

        init() {
            this.localPeer.on('connection', (connection) => {
                mlog.log("Incoming " + (connection.reliable?"reliable":"unreliable")+ " connection from " + connection.peer);
                this.onConnectionToPeerCreate(connection);
            });
            nc = this;
        }

        /**
        * Transmit reliably to all connected peers
        * @param data to transmit (JSON), must have a field 't' with the type.
        */
        broadcastReliable(data: any) {
            for (var id in this.connections) {
                this.connections[id].sendReliable(data);
            }
        }


        /**
        * Transmit unreliably to all connected peers
        * Do not rely on these packages arriving or being in order!
        * @param data to transmit (JSON), must have a field 't' with the type.
        */
        broadcastUnreliable(data: any) {
            for (var id in this.connections) {
                this.connections[id].sendUnreliable(data);
            }
        }

        connectToPeers = (peers) => {

            for (var i = 0; i < peers.length; i++) {
                mlog.log("Connecting reliably to all peers");
                this.connectToPeerReliable(peers[i]);
            }
        }

        connectToPeerReliable(id: string) {
            mlog.log("Establishing reliable connection to peer " + id);
            var connection = this.localPeer.connect(id, { reliable: true,  });
            this.onConnectionToPeerCreate(connection);
        }
        connectToPeerUnreliable(id: string) {
            mlog.log("Establishing unreliable connection to peer " + id);
            var connection = this.localPeer.connect(id, { reliable: false });
            this.onConnectionToPeerCreate(connection);
        }


        private onConnectionToPeerCreate = (connection: PeerJs.DataConnection) => {
            connection.on('open', () => this.onConnectionEstablished(connection));
        }

        private onConnectionEstablished = (connection: PeerJs.DataConnection) => {
            mlog.log((connection.reliable ? "Reliable" : "Unreliable") + " connection established to " + connection.peer);
            connection.on('close', () => this.onConnectionClosed(connection));

            var networkConnection;

            if (connection.reliable) { //Reliable connection

                //Create a new network connection wrapper.
                networkConnection = new NetworkConnection(connection);
                this.connections[connection.peer] = networkConnection;

                this.onNewConnection.trigger(networkConnection);
                connection.on('data', (data) => this.onReceiveReliable.trigger(data, networkConnection));
                
                //After reliable connection has been made, create an unreliable one.
                this.connectToPeerUnreliable(connection.peer);
            }
            else { //Unreliable connection

                //Hack for dual unreliable connection in Chrome (scratch that, also in FF, PeerJS faulty?)
                if (this.connections[connection.peer].unreliableConnection && this.connections[connection.peer].unreliableConnection.open) {
                    mlog.warn("Discarding second, faulty unreliable connection, thank you Obama");
                    return;
                }
                networkConnection = this.connections[connection.peer];
                networkConnection.addUnreliableConnection(connection);
                this.onNewUnreliableConnection.trigger(networkConnection);

                connection.on('data', (data) => this.onReceiveUnreliable.trigger(data, networkConnection));
            }

        }



        private onConnectionClosed = (connection: PeerJs.DataConnection) => {
            mlog.log((connection.reliable ? "Reliable" : "Unreliable") + " connection closed to " + connection.peer);
            

            if (this.connections[connection.peer]) {

                this.onConnectionClose.trigger(this.connections[connection.peer]);

                if (connection.reliable) {
                    this.connections[connection.peer].destroy();
                    delete this.connections[connection.peer];
                }

            }
        }

    }

}