/// <reference path="user.ts" />
/// <reference path="../network/networkedmesh.ts" />
import network = wm.network;

module wm.multi {
   
    export class RemoteUser extends wm.multi.User{

        avatar: network.NetworkedMesh;
        room: string;

        constructor(id: string) {
            super(id);
            var mesh = this.createAvatarMesh(id);
            this.avatar = new network.NetworkedMesh(mesh);
        }


        createAvatarMesh(id: string): THREE.Mesh {
            return new THREE.Mesh(new THREE.BoxGeometry(8, 16, 8));
        }

        onRoomSwitch() {
            this.avatar.clearBuffer();

        }

        update() {
            this.avatar.update();
        }

        receivePositionPacket(packet: network.PositionPacket) {
            this.avatar.receivePosition(packet);
        }


    }

    
}