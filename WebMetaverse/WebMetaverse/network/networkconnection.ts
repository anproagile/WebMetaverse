/// <reference path="../typings/peerjs/Peer.d.ts"/>
/// <reference path="../typings/threejs/three.d.ts"/>

/// <reference path="../event/event.ts"/>
module WM.Network {

    export class NetworkConnection {
        connection: PeerJs.DataConnection;
        unreliableConnection: PeerJs.DataConnection;

        public onReceive: Events.I2ArgsEvent<any, boolean> = new Events.TypedEvent();
        public onReceiveReliable: Events.I1ArgsEvent<any> = new Events.TypedEvent();
        public onReceiveUnreliable: Events.I1ArgsEvent<any> = new Events.TypedEvent();
        public onDestroy: Events.I1ArgsEvent<any> = new Events.TypedEvent();

        constructor(connection: PeerJs.DataConnection) {
            this.connection = connection;
            connection.on('data', (data) => this._onReceiveReliable(data));
        }

        addUnreliableConnection(connection: PeerJs.DataConnection) {
            if (connection.reliable) {
                mlog.error("You should add the unreliable connection here :c");
            }
            this.unreliableConnection = connection;
            connection.on('data', (data) => this._onReceiveUnreliable(data));
        }


        _onReceiveReliable(data: any) {
            this.onReceiveReliable.trigger(data);
            this.onReceive.trigger(data, false);
        }

        _onReceiveUnreliable(data: any) {
            this.onReceiveUnreliable.trigger(data);
            this.onReceive.trigger(data, false);
        }

        sendReliable(data: any) {
            this.connection.send(data);
        }
        sendUnreliable(data: any) {
            if (this.unreliableConnection) {
                this.unreliableConnection.send(data);
            }
        }

        public destroy() {
            this.onDestroy.trigger({});
            this.connection.close();
            if (this.unreliableConnection)
                this.unreliableConnection.close();
        }

    }
}