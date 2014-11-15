module wm.verse {

    export class VerseControls {

        //Time of last frame
        time: number = performance.now();

        controls: PointerLockControls;
        camera: THREE.Camera;
        cameraObject: THREE.Object3D;
        prevPos: THREE.Vector3; //Camera position previous frame

        constructor(camera: THREE.Camera, roomCoordinator: RoomCoordinator) {
            this.camera = camera;
            this.controls = new PointerLockControls(camera);

            this.cameraObject = this.controls.getObject();
            this.cameraObject.position.z = 30;

            new PointerLock(this.controls);
            roomCoordinator.onRoomSwitch.add(this.moveToRoom);

        }

        public update() {

            var dt: number = performance.now() - this.time;
            dt = Math.min(50, dt); //Minimum controls update FPS, 20

            this.controls.update(dt);
            this.prevPos = this.cameraObject.position.clone();

            this.time = performance.now();

        }


        moveToRoom = (fromRoom: room.Room, room: room.Room,
            position = new THREE.Matrix4()) => {

            fromRoom.scene.remove(this.cameraObject);
            room.add(this.cameraObject);
            this.cameraObject.position.setFromMatrixPosition(position);
        }

        public checkPortalIntersection(room: room.Room): Portal {
            var currentPos = this.camera.position;

            if (this.prevPos) {
                for (var i = 0; i < room.portals.length; i++) {
                    if (room.portals[i].checkIntersection(this.prevPos, currentPos)) {
                        return room.portals[i];
                    }
                }
            }
            return null;
        }




    }

}