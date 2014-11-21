/// <reference path="positionbroadcaster.ts" />
/// <reference path="remoteavatarroommover.ts" />
/// <reference path="remoteavatarwatcher.ts" />

/// <reference path="roomcommunicator.ts" />
module wm.multi {

    export class MultiUserClient {

        networkClient: network.NetworkClient;
        remoteAvatarWatcher: multi.RemoteAvatarWatcher;
        roomCommunicator: multi.RoomCommunicator;
        avatarRoomMover: multi.RemoteAvatarRoomMover;

        constructor(roomState: verse.RoomState, controls: verse.VerseControls) {
            this.networkClient = new network.NetworkClient();
            this.remoteAvatarWatcher = new multi.RemoteAvatarWatcher(this.networkClient.p2p);
            this.roomCommunicator = new multi.RoomCommunicator(this.networkClient.p2p, roomState)
            this.avatarRoomMover = new multi.RemoteAvatarRoomMover(this.roomCommunicator, roomState, this.remoteAvatarWatcher);
            this.roomCommunicator.onRemoteUserRoomSwitch.add((from, to, id) => this.remoteAvatarWatcher.getAvatarForId(id).clearBuffer());

            multi.PositionBroadcaster.start(controls.cameraObject, this.networkClient.p2p);

        }

        update() {
            this.remoteAvatarWatcher.update();
        }


    }


}