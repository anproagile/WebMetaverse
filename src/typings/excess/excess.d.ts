declare module excess {
    var log: (...msg: any[]) => any;
    var debug: (...msg: any[]) => any;
    var err: (...msg: any[]) => any;
}
declare var c: excess.ExcessClient;
declare module excess {
    /**
    * Wraps a WebRTC DataChannel
    */
    class Channel {
        private dataChannel;
        onMessage: events.I1ArgsEvent<any>;
        onClose: events.I1ArgsEvent<any>;
        onError: events.I1ArgsEvent<any>;
        onOpen: events.I1ArgsEvent<any>;
        label: string;
        constructor(rtcDataChannel: RTCDataChannel);
        attachCallbacks(): void;
        send(message: any): void;
        private _onMessage;
        private _onError;
        private _onClose;
        private _onOpen;
    }
}
declare module excess {
    class ExcessClient {
        /**
        * Triggered when a new connection is made, requested by a peer.
        */
        onConnection: events.I1ArgsEvent<ExcessPeer>;
        connections: {
            [id: string]: ExcessPeer;
        };
        id: string;
        currentRoom: string;
        private signaller;
        private rtcConfig;
        constructor(signalEndpoint: string, id: string, iceServers?: any[]);
        connectToServer(): Thenable<{}>;
        /**
        * Connect to peer by ID
        */
        connect(id: string): ExcessPeer;
        private createPeer(id);
        private receiveSignalMessage;
        /**
        * Join or switch to given room
        */
        joinRoom(room: string): void;
        requestRoom(room: string, callback: (peers: string[]) => any): void;
    }
}
declare module excess {
    class ExcessPeer {
        onClose: events.IEvent;
        onDataChannelReceive: ChannelReceiveEvent;
        signaller: Signaller;
        id: string;
        connection: RTCPeerConnection;
        caller: boolean;
        channels: {
            [id: string]: Channel;
        };
        remoteDescriptionSet: boolean;
        iceBuffer: RTCIceCandidate[];
        constructor(id: string, signaller: Signaller, rtcConfig: RTCConfiguration);
        call(): void;
        answer(offerSDP: RTCSessionDescriptionInit): void;
        private onSDPCreate;
        private onSDPError;
        createDataChannel(label: string, opts?: RTCDataChannelInit): excess.Channel;
        private addDataChannel(dc);
        addIceCandidate(candidate: RTCIceCandidate): void;
        setRemoteDescription(sdpi: RTCSessionDescriptionInit, callback?: () => void): void;
        private onLocalDescrAdded;
        private addIceBuffer();
        private onStateChange;
        private onIceStateChange;
        private onIceCandidate;
    }
    interface ChannelReceiveEvent extends events.IEvent {
        add(listener: (channel: Channel) => any): void;
        remove(listener: (channel: Channel) => any): void;
        trigger(channel: Channel): void;
    }
}
declare module excess {
    class Signaller {
        //socket: Phoenix.Socket;
		socket: any;
        private signalChannel;
        currentRoom: string;
        private endPoint;
        onSignal: SignalEvent;
        private discoveryChannel;
        private discoveryCallbacks;
        id: string;
        constructor(endPoint: string, id: string);
        connect(): Promise<{}>;
        join(room: string): void;
        private addChannel;
        private addDiscoveryChannel(channel);
        /**
        * Receive answer from server (about who is in some room).
        */
        private receiveDiscovery;
        discover(room: string, callback: (peers: string[]) => void): void;
        /**
        * Send message to peer, via signalling server
        */
        signal(toId: string, payload: any): void;
    }
    interface SignalEvent extends events.IEvent {
        add(listener: (from: string, data: any) => any): void;
        remove(listener: (from: string, data: any) => any): void;
        trigger(from: string, data: any): void;
    }
}
