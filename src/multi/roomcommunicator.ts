module wm.multi {

    /** 
     * Communicates to other users when new rooms are entered by user.
     * Also receives these messages.
     */
    export class RoomCommunicator {

        p2p: network.P2PNetworkClient;
        remoteUserState: multi.RemoteUserState;
        roomState: verse.RoomState;

        constructor(remoteUserState: multi.RemoteUserState, p2p: network.P2PNetworkClient, roomState: verse.RoomState) {
            this.p2p = p2p;
            this.remoteUserState = remoteUserState;
            this.roomState = roomState;
            this.init();
        }

        init() {
            this.roomState.onRoomSwitch.add(this.broadcastRoomTransfer);
            this.p2p.onReceiveReliable.add(this.handleRoomTransferPacket);

            this.p2p.onNewConnection.add( this.sendCurrentRoom);
        }


        handleRoomTransferPacket = (packet: any, connection: network.NetworkConnection) => {

            if (packet.t != 'roomswitch') return; //Not a roomswitch packet
            
            this.remoteUserState.onRemoteUserRoomSwitch.trigger(packet.prevRoom, packet.newRoom, connection.id);
        }

        broadcastRoomTransfer = (prevRoom: room.Room, newRoom: room.Room, pos: THREE.Matrix4) => {
            var packet: RoomSwitchPacket =
                {
                    t: 'roomswitch',
                    prevRoom: prevRoom.id,
                    newRoom: newRoom.id
                };

            this.p2p.broadcastReliable(packet);
        }

        sendCurrentRoom = (connection: network.NetworkConnection) => {

            var currentRoom = this.roomState.currentRoom;

            var packet: RoomSwitchPacket =
                {
                    t: 'roomswitch',
                    prevRoom: 'None',
                    newRoom: currentRoom.id
                };

            connection.sendReliable(packet);
        }

    }


    interface RoomSwitchPacket {
        t: string; //'roomswitch'
        newRoom: string;
        prevRoom: string;
    }

    export interface RoomSwitchEvent extends events.IEvent {
        add(listener: (prevRoom: string, newRoom: string, userId: string) => any): void;
        remove(listener: (prevRoom: string, newRoom: string, userId: string) => any): void;
        trigger(prevRoom: string, newRoom: string, userId: string): void;
    }






}