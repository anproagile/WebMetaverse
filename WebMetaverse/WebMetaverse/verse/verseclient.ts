/// <reference path="../room/room.ts" />
/// <reference path="portal.ts" />
/// <reference path="versecontrols.ts" />
/// <reference path="../multi/positionbroadcaster.ts" />
/// <reference path="../multi/roomcommunicator.ts" />
/// <reference path="../multi/remoteavatarwatcher.ts" />
/// <reference path="../multi/remoteavatarroommover.ts" />
/// <reference path="roomstate.ts" />

module wm.verse {
    export class VerseClient {

        renderer: THREE.WebGLRenderer;
        gl: WebGLRenderingContext;

        camera: THREE.PerspectiveCamera;

        networkClient: network.NetworkClient;
        remoteAvatarWatcher: multi.RemoteAvatarWatcher;
        roomCommunicator: multi.RoomCommunicator;
        avatarRoomMover: multi.RemoteAvatarRoomMover;

        roomCoordinator: RoomState;
        controls: VerseControls;


        constructor(renderer: THREE.WebGLRenderer) {
            this.renderer = renderer;
            this.gl = this.renderer.context;

            var aspect = window.innerWidth / window.innerHeight;
            this.camera = new THREE.PerspectiveCamera(70, aspect, 0.001, 2000);

            this.networkClient = new network.NetworkClient();
            this.roomCoordinator = new verse.RoomState();

            this.remoteAvatarWatcher = new multi.RemoteAvatarWatcher(this.networkClient.p2p);
            this.roomCommunicator = new multi.RoomCommunicator(this.networkClient.p2p, this.roomCoordinator)
            this.avatarRoomMover = new multi.RemoteAvatarRoomMover(this.roomCommunicator, this.roomCoordinator, this.remoteAvatarWatcher);

            this.roomCommunicator.onRemoteUserRoomSwitch.add( (from, to, id) => this.remoteAvatarWatcher.getAvatarForId(id).clearBuffer() );


            this.controls = new VerseControls(this.camera, this.roomCoordinator);

            window.addEventListener('resize', this.onWindowResize);
            multi.PositionBroadcaster.start(this.controls.cameraObject, this.networkClient.p2p);

        }

        update() {

            this.controls.update();
            this.remoteAvatarWatcher.update();

            var intersectedPortal = this.controls.checkPortalIntersection(this.roomCoordinator.currentRoom);
            if (intersectedPortal) {
                console.log("Moved through portal!");
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