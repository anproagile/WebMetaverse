module wm.multi {
    export class RemoteAvatarWatcher {

        private avatars: { [id: string]: network.NetworkedMesh };


        public onAvatarDestroy: Events.I1ArgsEvent<string> = new Events.TypedEvent();


        constructor(p2p: network.P2PNetworkClient) {
            this.avatars = {};
            this.init(p2p);
            
        }

        private init(p2p) {
            p2p.onNewUnreliableConnection.add( (con: network.NetworkConnection) => {
                var id = con.connection.peer;
                var mesh = this.createAvatarMesh(id);
                var avatar = new network.NetworkedMesh(mesh);
                this.avatars[id] = avatar;

                con.onReceiveUnreliable.add(avatar.receivePosition);

                con.onDestroy.add(() => {
                    var id = con.connection.peer;
                    this.onAvatarDestroy.trigger(id);

                    con.onReceiveUnreliable.remove(this.avatars[id].receivePosition);
                    delete this.avatars[id];

                });

            });

        }

        public getAvatarForId(id: string): network.NetworkedMesh {
            return this.avatars[id];
        }


        private createAvatarMesh(id: string): THREE.Mesh {
            var mesh = new THREE.Mesh(new THREE.BoxGeometry(8, 16, 8));
            mesh.name = id + "AVATAR";
            return mesh;
        }


        public update() {
            for (var id in this.avatars) {
                this.avatars[id].update();
            }

        }

    }



}