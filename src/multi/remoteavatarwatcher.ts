module wm.multi {
    /**
     * Creates new avatars, calls interpolation/extrapolation of these meshes on update.
    **/
    export class RemoteAvatarWatcher {

        remoteUserState: RemoteUserState;
        roomState: verse.RoomState;


        constructor(remoteUserState: RemoteUserState, p2p: network.P2PNetworkClient, roomState: verse.RoomState) {
            this.remoteUserState = remoteUserState;
            this.roomState = roomState;
            this.init(p2p);
        }

        private init(p2p): void {


            p2p.onNewConnection.add( (con: network.NetworkConnection) => {
                var id = con.id;
                var mesh = this.createAvatarMesh(id);
                var avatar = new network.NetworkedMesh(mesh);

                //Add new avatar to model
                this.remoteUserState.setAvatarForId(id, avatar);

                //Listen for packets (position packets)
                con.onReceiveUnreliable.add(avatar.receivePosition);

                con.onDestroy.add(() => {
                    var id = con.id;

                    con.onReceiveUnreliable.remove(this.remoteUserState.getAvatarForId(id).receivePosition);
                    this.remoteUserState.destroyAvatarForId(id);
                });

            });

            this.remoteUserState.onRemoteUserRoomSwitch.add(this.moveAvatar);
            this.remoteUserState.onAvatarDestroy.add(this.destroyAvatar);


        }


        private createAvatarMesh(id: string): THREE.Mesh {
            var mesh = new THREE.Mesh(new THREE.BoxGeometry(8, 16, 8));
            mesh.name = id + "AVATAR";
            return mesh;
        }


        public update() {
            for (var id in this.remoteUserState.avatars) {
                this.remoteUserState.avatars[id].update();
            }
        }


        moveAvatar = (from, to, userId) => {

            console.log("Moving user " + userId + " from " + from + " to " + to);

            var avatar = this.remoteUserState.getAvatarForId(userId);
            if (!avatar) {
                throw "Trying to move non-existant avatar to some other room";
            }

            if (this.roomState.roomDictionary[from]) {
                //console.log("Removed from " + from);
                this.roomState.roomDictionary[from].remove(avatar.mesh);
            }

            this.remoteUserState.userIdRoomMap[userId] = to;
            var room = this.roomState.roomDictionary[to];
            if (room) {

                room.add(avatar.mesh)
            }
            else {
                console.warn("Avatar moved to not yet loaded room, handling this is to be implemented");
            }

        }

        destroyAvatar = (userId: string) => {
            var avatar = this.remoteUserState.getAvatarForId(userId);

            var roomId = this.remoteUserState.userIdRoomMap[userId];

            //User is in a room
            if (roomId) {
                var room = this.roomState.roomDictionary[roomId];
                if (room) { //This room has been loaded (and thus the avatar is in there).
                    room.remove(avatar.mesh);
                }
                delete this.remoteUserState.userIdRoomMap[userId];
            }

        }



    }



}