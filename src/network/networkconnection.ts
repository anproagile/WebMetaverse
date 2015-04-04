module wm.network {

    export class NetworkConnection{

        public onReceive: PacketReceiveEvent2 = new events.TypedEvent();
        public onReceiveReliable: PacketReceiveEvent = new events.TypedEvent();
        public onReceiveUnreliable: PacketReceiveEvent = new events.TypedEvent();
        public onDestroy: events.IEvent = new events.TypedEvent();

        peer: excess.ExcessPeer;
        reliable: excess.Channel;
        unreliable: excess.Channel;

        unreliableOpen = false;
        reliableOpen = false;

        preOpenMessageBuffer = []

        get id() {
            return this.peer.id;
        }

        constructor(peer: excess.ExcessPeer) {
            this.peer = peer;

            this.peer.onDataChannelReceive.add((channel) => {
                if (channel.label == 'reliable') {
                    this.addChannel(channel, true)
                }
                else if (channel.label == 'unreliable') {
                    this.addChannel(channel, false)
                }

            });

            this.peer.onClose.add(() => this.destroy);
        }


        createDefaultChannels() {
            var rchan = this.peer.createDataChannel('reliable', { reliable: true });
            this.addChannel(rchan, true);
            var uchan = this.peer.createDataChannel('unreliable', { reliable: false });
            this.addChannel(uchan, false);
        }



        addChannel = (channel: excess.Channel, reliable) => {

            channel.onOpen.add(() => {
                if (reliable) {
                    this.reliable = channel;
                    this.reliableOpen = true;
                    this.reliable.onMessage.add(this._onReceiveReliable);
                    this.sendBufferedMessages();
                }
                else {
                    this.unreliable = channel;
                    this.unreliableOpen = true;
                    this.unreliable.onMessage.add(this._onReceiveUnreliable);
                }
            });
        }

        _onReceiveReliable = (data: any) => {
            this.onReceiveReliable.trigger(data);
            console.log("received data: ",data);
            this.onReceive.trigger(data, false);
        }

        _onReceiveUnreliable = (data: any) => {
            this.onReceiveUnreliable.trigger(data);
            //console.log("received data: ", data);
            this.onReceive.trigger(data, false);
        }

        sendReliable(data: any) {
            if (this.reliableOpen) {
                this.reliable.send(data);
            }
            else { // Buffer the message to send later when connection opens
                this.preOpenMessageBuffer.push(data);
            }
        }
        sendUnreliable(data: any) {
            
            if (this.unreliableOpen) {
                this.unreliable.send(data);
            }
        }

        private sendBufferedMessages() {
            for (var i = 0; i < this.preOpenMessageBuffer.length; i++) {
                this.sendReliable(this.preOpenMessageBuffer[i]);
            }
            this.preOpenMessageBuffer = []
        }

        public destroy() {
            console.log("Destroying connection " + this.id);
            this.onDestroy.trigger();
            this.reliableOpen = false;
            this.unreliableOpen = false;
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