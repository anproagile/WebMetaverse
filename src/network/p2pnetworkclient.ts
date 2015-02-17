/// <reference path="../typings/threejs/three.d.ts"/>

/// <reference path="networkclient.ts"/>
/// <reference path="networkconnection.ts"/>
/// <reference path="networkedmesh.ts"/>
/// <reference path="../event/event.ts"/>

var nc; //FIXME Debug variable, remove later!

module wm.network {

    export class P2PNetworkClient {

        connections: { [id: string]: NetworkConnection };
        networkClient: NetworkClient;


        get excess(): excess.ExcessClient {
            return this.networkClient.excess;
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

            this.excess.onConnection.add((peer) => {
                



            });

            //this.excess.on('connection', (connection) => {
            //    mlog.log("Incoming " + (connection.reliable?"reliable":"unreliable")+ " connection from " + connection.peer);
            //    this.onConnectionToPeerCreate(connection);
            //});
            nc = this;
        }

        /**
        * Transmit reliably to all connected peers
        * @param data to transmit (JSON), should have a field 't' with the type.
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
                mlog.log("Connecting to peers");

                if (peers[i] != this.networkClient.localId) {
                    this.connectToPeer(peers[i]);
                }


            }
        }

        connectToPeer(id: string) {
            mlog.log("Establishing reliable connection to peer " + id);
            var peer = this.excess.connect(id);
            var connection = new NetworkConnection(peer);


            mlog.log("Connecting to " + connection.id);
            connection.peer.onClose.add(() => this.onConnectionClosed(connection));

            this.connections[connection.id] = connection;
            

        }

        private onConnectionClosed = (connection: NetworkConnection) => {
            mlog.log("Connection closed to " + connection.id);
            
            if (this.connections[connection.id]) {

                this.onConnectionClose.trigger(this.connections[connection.id]);

                if (connection.reliable) {
                    this.connections[connection.id].destroy();
                    delete this.connections[connection.id];
                }

            }
        }

    }

}