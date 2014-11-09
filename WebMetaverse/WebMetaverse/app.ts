/// <reference path="typings/threejs/three.d.ts"/>
/// <reference path="network/networkclient.ts"/>
/// <reference path="verse/portal.ts"/>
/// <reference path="verse/room.ts"/>
/// <reference path="pointerlock.ts"/>

var webmetaverse = {};
var nc;


module WM {

    export class WebMetaverse {

        time: number = Date.now();
        renderer: THREE.WebGLRenderer;
        camera: THREE.PerspectiveCamera;
        cameraObject: THREE.Object3D;
        prevPos: THREE.Vector3; //Camera position previous frame
        controls: any;
        originalCameraMatrixWorld: any;
        currentRoom: Room;
        rooms: Room[];

        networkClient: WM.Network.NetworkClient;

        constructor() {
            webmetaverse = this;
            

            this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 2000);
            this.createRenderer();

            document.body.appendChild(this.renderer.domElement);
            this.rooms = [];
            this.createDebugWorld();
            this.createControls();
            window.addEventListener('resize', this.onWindowResize);

            this.createNetworkClient();
            this.networkClient.room = this.currentRoom;
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
            this.controls = new THREE.PointerLockControls(this.camera);
            this.cameraObject = this.controls.getObject();
            this.cameraObject.position.z = 30;
           // this.cameraObject.matrixAutoUpdater = true;
            new PointerLock(this.controls);
            this.currentRoom.add(this.cameraObject);
        }

        private createDebugWorld() {
            this.currentRoom = this.createDebugRoom1();
            this.rooms.push(this.currentRoom);
            this.rooms.push(this.createDebugRoom2());
            this.createDebugPortals();
        }

        private createNetworkClient() {
            this.networkClient = new Network.NetworkClient();
        }

        private createDebugRoom1(): Room {
            var room = new Room();
            var grid = new THREE.GridHelper(100, 10);
            room.add(grid);

            var g = new THREE.BoxGeometry(60, 20, 10);
            var m = new THREE.MeshNormalMaterial();
            var cube = new THREE.Mesh(g, m);
            cube.position.set(0, 10, -95);
            room.add(cube);

            var g2 = new THREE.IcosahedronGeometry(50, 2);
            var m2 = new THREE.MeshNormalMaterial();
            var obj2 = new THREE.Mesh(g2, m2);
            obj2.position.set(0, 10, 95);
            room.add(obj2);

            return room;
        }

        private createDebugRoom2(): Room {
            var room = new Room();
            var g = new THREE.BoxGeometry(60, 20, 10);
            var m = new THREE.MeshPhongMaterial();
            var cube = new THREE.Mesh(g, m);
            cube.position.set(0, 10, -95);
            room.add(cube);

            var sphereGeom = new THREE.SphereGeometry(10);
            var sphereMat = new THREE.MeshBasicMaterial({ color: 0x20F020 });
            var sphere = new THREE.Mesh(sphereGeom, sphereMat);
            sphere.position.x = 50;
            sphere.updateMatrix();
            sphereMat.side = THREE.BackSide;
            room.add(sphere);

            var sphereMat2 = new THREE.MeshBasicMaterial({ color: 0xF0F020 });
            var sphere2 = new THREE.Mesh(sphereGeom, sphereMat2);
            sphere2.position.x = -50;
            sphere2.updateMatrix();
            room.add(sphere2);

            var light = new THREE.DirectionalLight(0xffffff, 2);
            var light2 = new THREE.AmbientLight(0x303030);
            light.position.set(1, 1, 1).normalize();
            room.add(light);
            room.add(light2);
            var grid = new THREE.GridHelper(100, 10);
            grid.setColors(0xff0000, 0x00aacc);
            room.add(grid);

            return room;
        }

        private createDebugPortals(): void {

            //Create portal to current-room.
            var portalOut = new Portal(this.rooms[1]);
            var portalIn = new Portal(this.rooms[0]);
            
            //Make portals be eachother's end
            portalOut.toPortal = portalIn;
            portalIn.toPortal = portalOut;

            portalIn.rotateY(1.25*Math.PI);
            portalOut.position.x = -10;
            portalIn.position.x = 10;

            this.rooms[0].addPortal(portalOut);
            this.rooms[1].addPortal(portalIn);

            portalIn.updateStencilSceneMatrix();
            portalOut.updateStencilSceneMatrix();

        }
        
        tick = () => {
            this.camera.updateMatrixWorld(true);
            this.update();
            this.render();
            this.time = Date.now();

            requestAnimationFrame(this.tick);
        }

        i = 0;

        update() {
            this.i++;
            this.controls.update(Date.now() - this.time);
            this.checkPortalIntersection();

            this.networkClient.p2p.update();
            if (this.i % 5 == 0) {
                this.networkClient.p2p.broadcastUnreliable(
                    {
                        t: 'p',
                        ts: Date.now(),
                        x: this.cameraObject.position.x,
                        y: this.cameraObject.position.y,
                        z: this.cameraObject.position.z,
                        ry: this.cameraObject.rotation.y
                    });
            }
        }



        render() {
            var gl: WebGLRenderingContext = this.renderer.context;
            this.currentRoom.draw(gl, this.renderer, this.camera);

        }

        moveToRoom(room: Room, position: THREE.Matrix4 = new THREE.Matrix4()) {
            this.currentRoom.scene.remove(this.cameraObject);
            room.add(this.cameraObject);
           
            this.cameraObject.position.setFromMatrixPosition(position); 

            this.currentRoom = room;
        }

        
        private checkPortalIntersection() {
            var currentPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld);

            if (this.prevPos) {
                for (var i = 0; i < this.currentRoom.portals.length; i++) {

                    if (this.currentRoom.portals[i].checkIntersection(this.prevPos, currentPos)) {
                        var room = this.currentRoom.portals[i].toRoom;
                        var where = this.currentRoom.portals[i].getPortalViewMatrix(this.cameraObject.matrixWorld);
                        
                        this.moveToRoom(room, where);
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
        webvr.tick();
        webvr.networkClient.joinRoom();

    };
}



