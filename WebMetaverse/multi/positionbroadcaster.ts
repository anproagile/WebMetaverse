module wm.multi {
    export class PositionBroadcaster {

        static interval = 50;

        static start(object, p2p) {

            window.setInterval(this.broadcastPosition, this.interval, object, p2p);
        }



        static broadcastPosition(object: THREE.Object3D, p2p: network.P2PNetworkClient) {
            
            var pos: network.PositionPacket =  {
                t: 'p',
                ts: Date.now(),
                x: object.position.x,
                y: object.position.y,
                z: object.position.z,
                ry: object.rotation.y
            }
            p2p.broadcastUnreliable(pos);
        } 


    }



}