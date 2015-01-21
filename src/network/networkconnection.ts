module wm.network {

    export class NetworkConnection {
        connection: PeerJs.DataConnection;
        unreliableConnection: PeerJs.DataConnection;

        public onReceive: PacketReceiveEvent2 = new events.TypedEvent();
        public onReceiveReliable: PacketReceiveEvent = new events.TypedEvent();
        public onReceiveUnreliable: PacketReceiveEvent = new events.TypedEvent();
        public onDestroy: events.IEvent = new events.TypedEvent();

        constructor(connection: PeerJs.DataConnection) {
            this.connection = connection;
            connection.on('data', this._onReceiveReliable);
        }

        addUnreliableConnection(connection: PeerJs.DataConnection) {
            if (connection.reliable) {
                mlog.error("You should add the unreliable connection here :c");
            }
            this.unreliableConnection = connection;
            connection.on('data', this._onReceiveUnreliable);
        }


        _onReceiveReliable = (data: any) => {
            this.onReceiveReliable.trigger(data);
            this.onReceive.trigger(data, false);
        }

        _onReceiveUnreliable = (data: any) => {
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
            this.onDestroy.trigger();
            this.connection.close();
            if (this.unreliableConnection)
                this.unreliableConnection.close();
        }

    }

    export interface PacketReceiveEvent extends events.IEvent {
        add(listener: (data: any) => any): void;
        remove(listener: (data: any) => any): void;
        trigger(data: any): void;
    }

    export interface PacketReceiveEvent2 extends events.IEvent {
        add(listener: (data: any, reliable: boolean) => any): void;
        remove(listener: (data: any, reliable: boolean) => any): void;
        trigger(data: any, reliable: boolean): void;
    }




}