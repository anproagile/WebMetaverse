module wm.multi {
    export class RemoteUserState {

        public onAvatarDestroy: events.I1ArgsEvent<string> = new events.TypedEvent();
        public onRemoteUserRoomSwitch: RoomSwitchEvent = new events.TypedEvent();

        /**
         * Map of (remote) user ID to avatar
         */
        public avatars: { [id: string]: network.NetworkedMesh };

        /**
         * Map of (remote) user ID to room ID
         */
        public userIdRoomMap: { [userId: string]: string };

        

        constructor() {
            this.avatars = {};
            this.userIdRoomMap = {};
        }

        public setAvatarForId(id: string, avatar: network.NetworkedMesh): void {
            this.avatars[id] = avatar;
        }

        public getAvatarForId(id: string): network.NetworkedMesh {
            return this.avatars[id];
        }

        public removeAvatarForId(id: string) {
            this.onAvatarDestroy.trigger(id);
            delete this.avatars[id];
        }






    }


}