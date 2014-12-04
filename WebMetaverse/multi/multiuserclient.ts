/// <reference path="positionbroadcaster.ts" />
/// <reference path="remoteavatarroommover.ts" />
/// <reference path="remoteavatarwatcher.ts" />

/// <reference path="roomcommunicator.ts" />
/// <reference path="remoteuserstate.ts" />
module wm.multi {

    export class MultiUserClient {

        remoteUserState: multi.RemoteUserState;

        networkClient: network.NetworkClient;
        remoteAvatarWatcher: multi.RemoteAvatarWatcher;
        roomCommunicator: multi.RoomCommunicator;
        avatarRoomMover: multi.RemoteAvatarRoomMover;



        constructor(roomState: verse.RoomState, controls: verse.VerseControls) {

            this.remoteUserState = new RemoteUserState();

            this.networkClient = new network.NetworkClient();
            this.remoteAvatarWatcher = new multi.RemoteAvatarWatcher(this.remoteUserState, this.networkClient.p2p);
            this.roomCommunicator = new multi.RoomCommunicator(this.remoteUserState, this.networkClient.p2p, roomState)
            this.avatarRoomMover = new multi.RemoteAvatarRoomMover(this.remoteUserState, roomState);

            this.remoteUserState.onRemoteUserRoomSwitch.add((from, to, id) => this.remoteUserState.getAvatarForId(id).clearBuffer());
            multi.PositionBroadcaster.start(controls.cameraObject, this.networkClient.p2p);

        }

        update() {
            this.remoteAvatarWatcher.update();
            
        }


    }


}