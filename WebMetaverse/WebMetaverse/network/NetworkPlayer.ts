/// <reference path="../typings/peerjs/Peer.d.ts"/>
/// <reference path="../typings/threejs/three.d.ts"/>

module WM.Network {
    export class NetworkPlayer {
        connection: PeerJs.DataConnection;
        unreliableConnection: PeerJs.DataConnection;
        mesh: THREE.Mesh;

        constructor(connection: PeerJs.DataConnection) {
            this.connection = connection;
            connection.on('data', (data) => this.onReceiveReliable(data, connection.peer));
        }

        addUnreliableConnection(connection: PeerJs.DataConnection) {
            if (connection.reliable) {
                console.error("You should add the unreliable connection here :c");
            }
            this.unreliableConnection = connection;
            connection.on('data', (data) => this.onReceiveUnreliable(data, connection.peer));
        }



        onReceiveUnreliable(data: any, fromId: string) {
            if (data.type == 'chat') {
                console.log('Received chat "' + data.msg + '" from ' + fromId);
            }
            else if (data.type == 'p') {
                if (this.mesh) {
                    this.mesh.position.set(data.x, data.y, data.z);
                    this.mesh.rotation.set(this.mesh.rotation.x, data.ry, this.mesh.rotation.z);
                }
            }
        }

        onReceiveReliable(data: any, fromId: string) {
            if (data.type == 'chat') {
                console.log('Received chat "' + data.msg + '" from ' + fromId);
            }
            else if (data.type == 'p') {
                if (this.mesh) {
                    this.mesh.position.set(data.x, data.y, data.z);
                    this.mesh.rotation.set(this.mesh.rotation.x, data.ry, this.mesh.rotation.z);
                }
            }
        }

        sendReliable(data: any) {
            this.connection.send(data);
        }
        sendUnreliable(data: any) {
            this.unreliableConnection.send(data);
        }



        sendChatMessage(message: string) {
            this.connection.send({ type: 'chat', msg: message });
        }

        sendChatMessageUnreliable(message: string) {
            this.unreliableConnection.send({ type: 'chat', msg: message });
        }

        sendPosition(pos: THREE.Vector3, rotationY: number) {
            if (this.unreliableConnection) {
                this.unreliableConnection.send({ type: 'p', x: pos.x, y: pos.y, z: pos.z, ry: rotationY });
            }
            else { //Fallback to reliable
                this.connection.send({ type: 'p', x: pos.x, y: pos.y, z: pos.z, ry: rotationY });
            }
        }

        public destroy() {
            this.connection.close();
            this.unreliableConnection.close();
        }

    }
}