module wm.multi {

    /**
     * Moves avatars between rooms when a roomswitch packet is received.
     */
    export class RemoteAvatarRoomMover {

        roomCoordinator: verse.RoomState;
        avatarWatcher: RemoteAvatarWatcher;

        /**
         * Keeps track of which room a user is in. Maps user ID to room ID
         */
        private userIdRoomDictionary: { [userId: string]: string };


        constructor(communicator: RoomCommunicator, roomState: verse.RoomState, avatarWatcher: RemoteAvatarWatcher) {
            this.roomCoordinator = roomState;
            this.avatarWatcher = avatarWatcher;
            this.userIdRoomDictionary = {};

            communicator.onRemoteUserRoomSwitch.add(this.moveAvatar);
            avatarWatcher.onAvatarDestroy.add(this.removeAvatar);
        }


        removeAvatar = (userId: string) => {
            var avatar = this.avatarWatcher.getAvatarForId(userId);
            if (!avatar) return;

            var roomId = this.userIdRoomDictionary[userId];
            if (roomId) {
                var room = this.roomCoordinator.roomDictionary[roomId];
                if (room) {
                    room.remove(avatar.mesh);
                }
                delete this.userIdRoomDictionary[userId];
            }

        }

        moveAvatar = (from, to, userId) => {

            console.log("Moving user " + userId + " from " + from + " to " + to);

            var avatar = this.avatarWatcher.getAvatarForId(userId);
            if (!avatar) {
                throw "Trying to move non-existant avatar to some other room";
            }

            if (this.roomCoordinator.roomDictionary[from]) {
                //console.log("Removed from " + from);
                this.roomCoordinator.roomDictionary[from].remove(avatar.mesh);
            }

            this.userIdRoomDictionary[userId] = to;
            var room = this.roomCoordinator.roomDictionary[to];
            if (room) {

                //Crazy workaround.. Instantly adding made avatar not show, despite being present in the new scene!.
                webmetaverse.doEndOfTick.push(() => { room.add(avatar.mesh) });
            }
            else {
                console.warn("Avatar moved to not yet loaded room, handling this is to be implemented");
            }

        }

    }

}