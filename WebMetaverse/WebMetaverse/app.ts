/// <reference path="typings/threejs/three.d.ts"/>
/// <reference path="network/networkclient.ts"/>
/// <reference path="verse/portal.ts"/>
/// <reference path="pointerlock.ts"/>
/// <reference path="pointerlockcontrols.ts"/>
/// <reference path="room/room.ts" />
/// <reference path="verse/roomcoordinator.ts" />

var webmetaverse = {};
var nc;
var fakeLag = 0;


module WM {

    export function urlToId(url: string): string {
        return btoa(url);
    }

    

    export class WebMetaverse {

        roomCoordinator: Verse.RoomCoordinator;

        time: number = Date.now();
        renderer: THREE.WebGLRenderer;
        camera: THREE.PerspectiveCamera;
        cameraObject: THREE.Object3D;
        prevPos: THREE.Vector3; //Camera position previous frame
        controls: PointerLockControls;
        originalCameraMatrixWorld: any;

        networkClient: WM.Network.NetworkClient;

        constructor() {
            webmetaverse = this;
            

            this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 2000);
            this.createRenderer();

            document.body.appendChild(this.renderer.domElement);
            this.createControls();
            window.addEventListener('resize', this.onWindowResize);
            this.createRoomHandler();
            this.createNetworkClient();
            nc = this.networkClient;
        }

        private createRenderer() {
            var renderer = new THREE.WebGLRenderer();
            renderer.setClearColor(0x000000);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.autoClear = false;
            this.renderer = renderer;
        }

        private createControls() {
            this.controls = new PointerLockControls(this.camera);
            this.cameraObject = this.controls.getObject();
            this.cameraObject.position.z = 30;
            
            new PointerLock(this.controls);
            //this.currentRoom.add(this.cameraObject);
        }

        private createRoomHandler() {
            this.roomCoordinator = new Verse.RoomCoordinator();
            this.roomCoordinator.onRoomSwitch.add((from, to, where) => this.moveToRoom(from, to, where));
        }


        private createNetworkClient() {
            this.networkClient = new Network.NetworkClient();
        }
        
        tick = () => {
            this.camera.updateMatrixWorld(true);
            this.update();
            this.render();
            this.time = performance.now();

            requestAnimationFrame(this.tick);
        }

        i = 0;

        update() {
            this.i++;

            var dt: number = performance.now() - this.time; 
            dt = Math.min(50, dt); //Minimum controls update FPS, 20
            
            this.controls.update(dt);
            
            this.checkPortalIntersection();

            this.networkClient.p2p.update();
            if (this.i % 5 == 0) {

                var timestamp = Date.now();
                timestamp = fakeLag ? timestamp + fakeLag : timestamp;


                this.networkClient.p2p.broadcastUnreliable(
                    {
                        t: 'p',
                        ts: timestamp,
                        x: this.cameraObject.position.x,
                        y: this.cameraObject.position.y,
                        z: this.cameraObject.position.z,
                        ry: this.cameraObject.rotation.y
                    });
            }
        }



        render() {
            var gl: WebGLRenderingContext = this.renderer.context;
            this.roomCoordinator.currentRoom.draw(gl, this.renderer, this.camera);

        }

        moveToRoom(fromRoom: Room.Room, room: Room.Room, position: THREE.Matrix4 = new THREE.Matrix4()) {
            fromRoom.scene.remove(this.cameraObject);
            room.add(this.cameraObject);
            this.cameraObject.position.setFromMatrixPosition(position); 
        }

        
        private checkPortalIntersection() {

            var currentRoom = this.roomCoordinator.currentRoom;
            if (!currentRoom) return;

            var currentPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld);

            if (this.prevPos) {
                for (var i = 0; i < currentRoom.portals.length; i++) {

                    if (currentRoom.portals[i].checkIntersection(this.prevPos, currentPos)) {
                        var roomId = currentRoom.portals[i].toRoomId;
                        var room = this.roomCoordinator.roomDictionary[roomId];
                        var where = currentRoom.portals[i].getPortalViewMatrix(this.cameraObject.matrixWorld);

                        this.roomCoordinator.switchToRoom(room, where);
                        break;
                    }

                }
            }
            
            this.prevPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld);
        }

        onWindowResize = (e) => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }


  
    window.onload = () => {
        var webvr = new WebMetaverse();
        webvr.roomCoordinator.loadRoom('debug1');
        webvr.roomCoordinator.switchToRoomWithId('debug1');
        webvr.tick();
        webvr.networkClient.joinRoom();
        webvr.roomCoordinator.loadRoom('debug2');

    };
}



