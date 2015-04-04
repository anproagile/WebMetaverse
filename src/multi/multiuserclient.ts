/// <reference path="positionbroadcaster.ts" />
/// <reference path="remoteavatarwatcher.ts" />

/// <reference path="roomcommunicator.ts" />
/// <reference path="remoteuserstate.ts" />
module wm.multi {

    export class MultiUserClient {

        remoteUserState: multi.RemoteUserState;

        networkClient: network.NetworkClient;
        remoteAvatarWatcher: multi.RemoteAvatarWatcher;
        roomCommunicator: multi.RoomCommunicator;

        constructor(roomState: verse.RoomState, controls: verse.VerseControls) {

            this.remoteUserState = new RemoteUserState();

            this.networkClient = new network.NetworkClient();
            this.remoteAvatarWatcher = new multi.RemoteAvatarWatcher(this.remoteUserState, this.networkClient.p2p, roomState);
            this.roomCommunicator = new multi.RoomCommunicator(this.remoteUserState, this.networkClient.p2p, roomState)

            //Clear movement history when moving through portals
            this.remoteUserState.onRemoteUserRoomSwitch.add((from, to, id) => this.remoteUserState.getAvatarForId(id).clearBuffer());

            //Start broadcasting position
            multi.PositionBroadcaster.start(controls.cameraObject, this.networkClient.p2p);

        }

        update() {
            this.remoteAvatarWatcher.update();
            
        }


    }


}