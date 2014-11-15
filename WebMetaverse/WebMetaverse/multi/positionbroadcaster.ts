module wm.multi {
    class PositionBroadcaster {

        static broadcastPosition(object: THREE.Object3D, p2p: network.P2PNetworkClient) {
            var pos: network.PositionPacket =  {
                t: 'p',
                ts: Date.now(),
                x: object.position.x,
                y: object.position.y,
                z: object.position.z,
                ry: object.rotation.y
            }
            p2p.broadcastUnreliable(object);
        } 


    }



}