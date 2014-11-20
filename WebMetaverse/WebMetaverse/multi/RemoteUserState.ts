module wm.multi {
    export class RemoteUserState {

        /**
         * Maps of (remote) user ID to room ID
         */
        private userIdRoomDictionary: { [userId: string]: string };

        /**
         * Maps of (remote) user ID to avatar
         */
        private avatars: { [id: string]: network.NetworkedMesh };




    }


}