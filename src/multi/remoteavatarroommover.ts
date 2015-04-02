module wm.multi {

    /**
     * Moves avatars between rooms when a roomswitch packet is received.
     */
    export class RemoteAvatarRoomMover {

        roomCoordinator: verse.RoomState;
        remoteUserState: RemoteUserState;


        constructor(remoteUserState: RemoteUserState, roomState: verse.RoomState) {
            this.roomCoordinator = roomState;
            this.remoteUserState = remoteUserState;

            remoteUserState.onRemoteUserRoomSwitch.add(this.moveAvatar);
            remoteUserState.onAvatarDestroy.add(this.removeAvatar);
        }


        removeAvatar = (userId: string) => {
            var avatar = this.remoteUserState.getAvatarForId(userId);
            if (!avatar) return;


            var roomId = this.remoteUserState.userIdRoomMap[userId];

            //User is in a room
            if (roomId) {
                var room = this.roomCoordinator.roomDictionary[roomId];
                if (room) { //This room has been loaded (and thus the avatar is in there).
                    room.remove(avatar.mesh);
                }
                delete this.remoteUserState.userIdRoomMap[userId];
            }

        }

        moveAvatar = (from, to, userId) => {

            console.log("Moving user " + userId + " from " + from + " to " + to);

            var avatar = this.remoteUserState.getAvatarForId(userId);
            if (!avatar) {
                throw "Trying to move non-existant avatar to some other room";
            }

            if (this.roomCoordinator.roomDictionary[from]) {
                //console.log("Removed from " + from);
                this.roomCoordinator.roomDictionary[from].remove(avatar.mesh);
            }

            this.remoteUserState.userIdRoomMap[userId] = to;
            var room = this.roomCoordinator.roomDictionary[to];
            if (room) {

                room.add(avatar.mesh)
            }
            else {
                console.warn("Avatar moved to not yet loaded room, handling this is to be implemented");
            }

        }

    }

}