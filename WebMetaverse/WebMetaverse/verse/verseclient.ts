/// <reference path="../room/room.ts" />
/// <reference path="portal.ts" />
/// <reference path="versecontrols.ts" />

module wm.verse {
    export class VerseClient {

        renderer: THREE.WebGLRenderer;
        gl: WebGLRenderingContext;

        camera: THREE.PerspectiveCamera;

        networkClient: network.NetworkClient;
        remoteAvatarWatcher: multi.RemoteAvatarWatcher;
        roomCoordinator: RoomCoordinator;
        controls: VerseControls;


        constructor(renderer: THREE.WebGLRenderer) {
            this.renderer = renderer;
            this.gl = this.renderer.context;

            var aspect = window.innerWidth / window.innerHeight;
            this.camera = new THREE.PerspectiveCamera(70, aspect, 0.001, 2000);

            this.networkClient = new network.NetworkClient();
            this.roomCoordinator = new verse.RoomCoordinator();

            this.remoteAvatarWatcher = new multi.RemoteAvatarWatcher(this.networkClient.p2p);

            this.controls = new VerseControls(this.camera, this.roomCoordinator);
            window.addEventListener('resize', this.onWindowResize);

        }

        update() {

            this.controls.update();
            this.remoteAvatarWatcher.update();

            var intersectedPortal = this.controls.checkPortalIntersection(this.roomCoordinator.currentRoom);
            if (intersectedPortal) {
                this.moveThroughPortal(intersectedPortal);
            }

            this.render();

        }

        render() {
            this.roomCoordinator.currentRoom.render(this.gl, this.renderer, this.camera);
        }



        moveThroughPortal(portal: Portal) {
            var roomId = portal.toRoomId;
            var room = this.roomCoordinator.roomDictionary[roomId];
            var where = portal.getPortalViewMatrix(this.controls.camera.matrixWorld);
            this.roomCoordinator.switchToRoom(room, where);
        }

        onWindowResize = (event) => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }



    }


}