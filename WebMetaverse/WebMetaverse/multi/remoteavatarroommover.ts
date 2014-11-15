module wm.multi {

    /**
     * Moves avatars between rooms when a roomswitch packet is received.
     */
    export class RemoteAvatarRoomMover {

        roomCoordinator: verse.RoomCoordinator;
        avatarWatcher: RemoteAvatarWatcher;

        constructor(communicator: RoomCommunicator, coordinator: verse.RoomCoordinator, avatarWatcher: RemoteAvatarWatcher) {
            this.roomCoordinator = coordinator;
            this.avatarWatcher = avatarWatcher;

            communicator.onRemoteUserRoomSwitch.add(this.moveAvatar);
        }

        moveAvatar = (from, to, userId) => {
            var avatar = this.avatarWatcher.getAvatarForId(userId);
            if (!avatar) {
                throw "Trying to move non-existant avatar to some other room";
            }

            if (this.roomCoordinator.roomDictionary[from]) {
                this.roomCoordinator.roomDictionary[from].remove(avatar.mesh);
            }

            if (this.roomCoordinator.roomDictionary[to]) {
                this.roomCoordinator.roomDictionary[to].add(avatar.mesh);
            }
            else {
                console.warn("Avatar moved to not yet loaded room, handling this is to be implemented");
            }

        }

    }

}