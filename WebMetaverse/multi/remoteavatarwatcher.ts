module wm.multi {
    /**
     * Creates new avatars, calls interpolation/extrapolation of these meshes on update.
    **/
    export class RemoteAvatarWatcher {

        remoteUserState: RemoteUserState;



        constructor(remoteUserState: RemoteUserState, p2p: network.P2PNetworkClient) {
            this.remoteUserState = remoteUserState;
            this.init(p2p);
        }

        private init(p2p): void {


            p2p.onNewUnreliableConnection.add( (con: network.NetworkConnection) => {
                var id = con.connection.peer;
                var mesh = this.createAvatarMesh(id);
                var avatar = new network.NetworkedMesh(mesh);

                //Add new avatar to model
                this.remoteUserState.setAvatarForId(id, avatar);

                //Listen for packets (position packets)
                con.onReceiveUnreliable.add(avatar.receivePosition);

                con.onDestroy.add(() => {
                    var id = con.connection.peer;

                    con.onReceiveUnreliable.remove(this.remoteUserState.getAvatarForId(id).receivePosition);
                    this.remoteUserState.removeAvatarForId(id);
                });

            });

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

    }



}