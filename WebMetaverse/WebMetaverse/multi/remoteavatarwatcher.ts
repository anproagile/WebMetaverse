module wm.multi {
    export class RemoteAvatarWatcher {

        p2p: network.P2PNetworkClient;
        avatars: { [id: string]: network.NetworkedMesh };

        constructor(p2p: network.P2PNetworkClient) {
            this.p2p = p2p;
            this.avatars = {};
            this.init();
            
        }

        init() {
            this.p2p.onNewUnreliableConnection.add( (con: network.NetworkConnection) => {
                var id = con.connection.peer;
                var mesh = this.createAvatarMesh(id);
                var avatar = new network.NetworkedMesh(mesh);
                this.avatars[id] = avatar;

                con.onReceiveUnreliable.add(avatar.receivePosition);

                con.onDestroy.add(() => {
                    var id = con.connection.peer;
                    con.onReceiveUnreliable.remove(this.avatars[id].receivePosition);
                    delete this.avatars[id];

                });

            });

        }

        createAvatarMesh(id: string): THREE.Mesh {
            return new THREE.Mesh(new THREE.BoxGeometry(8, 16, 8));
        }


        update() {
            for (var id in this.avatars) {
                this.avatars[id].update();
            }

        }

    }



}