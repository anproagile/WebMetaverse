/// <reference path="phoenix.d.ts" />
/// <reference path="typings/webrtc/rtcpeerconnection.d.ts" />
declare module events {
    interface IEvent {
        add(listener: () => void): void;
        remove(listener: () => void): void;
        trigger(...a: any[]): void;
    }
    class TypedEvent implements IEvent {
        private _listeners;
        add(listener: () => void): void;
        remove(listener?: () => void): void;
        trigger(...a: any[]): void;
    }
}
declare module excess {
    var log: (message?: any, ...optionalParams: any[]) => void;
    var debug: (message?: string, ...optionalParams: any[]) => void;
    var err: (message?: any, ...optionalParams: any[]) => void;
}
declare module excess {
    /**
    * Wraps a WebRTC DataChannel
    */
    class Channel {
        private dataChannel;
        onMessage: events.IEvent;
        onClose: events.IEvent;
        onError: events.IEvent;
        onOpen: events.IEvent;
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
        connections: {
            [x: string]: ExcessPeer;
        };
        id: string;
        currentRoom: string;
        signaller: Signaller;
        rtcConfig: RTCConfiguration;
        constructor(signalEndpoint: string, id: string, iceServers?: any[]);
        connect(id: string): ExcessPeer;
        createPeer(id: string): ExcessPeer;
        receiveSignalMessage: (from: string, data: any) => void;
        joinRoom(room: string): void;
    }
}
declare module excess {
    class ExcessPeer {
        signaller: Signaller;
        id: string;
        connection: RTCPeerConnection;
        caller: boolean;
        channels: {
            [x: string]: Channel;
        };
        remoteDescriptionSet: boolean;
        iceBuffer: RTCIceCandidate[];
        onClose: events.IEvent;
        onDataChannelReceive: ChannelReceiveEvent;
        constructor(id: string, signaller: Signaller, rtcConfig: RTCConfiguration);
        call(): void;
        answer(offerSDP: RTCSessionDescriptionInit): void;
        onSDPCreate: (sdp: RTCSessionDescription) => void;
        onSDPError: (event: any) => void;
        createDataChannel(label: string, opts?: RTCDataChannelInit): Channel;
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
        socket: Phoenix.Socket;
        private signalChannel;
        currentRoom: string;
        onSignal: SignalEvent;
        private discoveryChannel;
        private discoveryCallbacks;
        id: string;
        constructor(endPoint: string, id: string);
        join(room: string): void;
        private addChannel;
        private addDiscoveryChannel(channel);
        /**
        * Receive answer from server (about who is in some room).
        */
        private receiveDiscovery;
        private discover(room, callback);
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
