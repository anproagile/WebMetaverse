module wm.network {

    export class NetworkConnection{

        public onReceive: PacketReceiveEvent2 = new events.TypedEvent();
        public onReceiveReliable: PacketReceiveEvent = new events.TypedEvent();
        public onReceiveUnreliable: PacketReceiveEvent = new events.TypedEvent();
        public onDestroy: events.IEvent = new events.TypedEvent();

        peer: excess.ExcessPeer;
        reliable: excess.Channel;
        unreliable: excess.Channel;

        get id() {
            return this.peer.id;
        }

        constructor(peer: excess.ExcessPeer) {
            this.peer = peer;
            //connection.on('data', this._onReceiveReliable);
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
            this.reliable.send(data);
        }
        sendUnreliable(data: any) {
            if (this.unreliable) {
                this.unreliable.send(data);
            }
        }

        public destroy() {
            this.onDestroy.trigger();

            //TODO Close connection gracefully
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