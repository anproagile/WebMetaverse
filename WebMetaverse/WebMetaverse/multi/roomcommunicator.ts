module wm.multi {

    /** 
     * Communicates to other users when new rooms are entered by user.
     * Also receives these messages.
     */
    export class RoomCommunicator {

        public onRemoteUserRoomSwitch: RoomSwitchEvent = new Events.TypedEvent();


        p2p: network.P2PNetworkClient;
        coordinator: verse.RoomCoordinator;

        constructor(p2p: network.P2PNetworkClient, roomCoordinator: verse.RoomCoordinator) {
            this.p2p = p2p;
            this.coordinator = roomCoordinator;
            this.init();
        }

        init() {
            this.coordinator.onRoomSwitch.add(this.broadcastRoomTransfer);
            this.p2p.onReceiveReliable.add(this.handleRoomTransferPacket);
        }


        handleRoomTransferPacket = (packet: any, connection: network.NetworkConnection) => {
            if (packet.t != 'roomswitch') return; //Not a roomswitch packet

            this.onRemoteUserRoomSwitch.trigger(packet.prevRoom, packet.newRoom, connection.connection.peer);

        }

        broadcastRoomTransfer = (prevRoom: room.Room, newRoom: room.Room, pos: THREE.Matrix4) => {
            var packet: RoomSwitchPacket =
                {
                    t: 'roomswitch',
                    newRoom: prevRoom.id,
                    prevRoom: newRoom.id
                };

            this.p2p.broadcastReliable(packet);
        }

    }


    interface RoomSwitchPacket {
        t: string; //'roomswitch'
        newRoom: string;
        prevRoom: string;
    }

    export interface RoomSwitchEvent extends Events.IEvent {
        add(listener: (prevRoom: string, newRoom: string, userId: string) => any): void;
        remove(listener: (prevRoom: string, newRoom: string, userId: string) => any): void;
        trigger(prevRoom: string, newRoom: string, userId: string): void;
    }






}