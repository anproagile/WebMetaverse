/// <reference path="../typings/peerjs/Peer.d.ts"/>
/// <reference path="../typings/threejs/three.d.ts"/>

module WM.Network {
    export class NetworkPlayer {
        connection: PeerJs.DataConnection;
        reliableConnection: PeerJs.DataConnection;
        mesh: THREE.Mesh;

        constructor(connection: PeerJs.DataConnection) {
            this.connection = connection;
            connection.on('data', (data) => this.onReceive(data, connection.peer));
        }

        onReceive(data: any, fromId: string) {
            if (data.type == 'chat') {
                console.log('Received chat "' + data.msg + '" from ' + fromId);
            }
            else if (data.type == 'pos') {
                if (this.mesh) {
                    this.mesh.position.set(data.x, data.y, data.z);
                }
            }
        }

        sendChatMessage(message: string) {
            this.connection.send({ type: 'chat', msg: message });
        }

        sendPosition(pos: THREE.Vector3) {
            this.connection.send({ type: 'pos', x: pos.x, y: pos.y, z: pos.z });
        }
    }
}