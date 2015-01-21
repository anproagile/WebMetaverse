module wm.network {
    export class ChatClient {

        private p2p: P2PNetworkClient;
        public onReceiveChat: ChatReceiveEvent = new events.TypedEvent();
        chatlog = Minilog('WM.Chat');

        constructor(p2p: P2PNetworkClient) {
            this.p2p = p2p;
            p2p.onReceiveReliable.add(this.onReceiveReliable);
        }

        public sendChat(message: string): void {
            this.sendChatPacket({ t: 'chat', msg: message });
            mlog.log("Sent chat message: " + message);
            this.chatlog.log("me : " + message);
        }

        private sendChatPacket(packet: ChatPacket): void {
            this.p2p.broadcastReliable(packet);
        }

        private onReceiveReliable = (data, nConnection: NetworkConnection) => {
            if (data.t == 'chat') {
                var sender = nConnection.connection.peer;
                mlog.log("Received chat message: " + data.msg + " from " + sender);
                this.chatlog.log(sender + ": " + data.msg);
                
                this.onReceiveChat.trigger(data, sender);
            }
        }

        

    }

    export interface ChatPacket {
        t: any; //'chat' in this case
        msg: string;
    }

    export interface ChatReceiveEvent extends events.IEvent {
        add(listener: (data: ChatPacket, sender: string) => any): void;
        remove(listener: (data: ChatPacket, sender: string) => any): void;
        trigger(data: ChatPacket, sender: string): void;
    }
}