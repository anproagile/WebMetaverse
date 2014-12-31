/// <reference path="../room/room.ts" />
/// <reference path="portal.ts" />
/// <reference path="versecontrols.ts" />
/// <reference path="../multi/multiuserclient.ts" />
/// <reference path="roomstate.ts" />
/// <reference path="../ui/userinterface.ts" />

module wm.verse {
    export class VerseClient {

        renderer: THREE.WebGLRenderer;
        gl: WebGLRenderingContext;

        camera: THREE.PerspectiveCamera;

        roomState: RoomState;
        controls: VerseControls;
        multiUserClient: multi.MultiUserClient

        userInterface: ui.UserInterface;


        constructor(renderer: THREE.WebGLRenderer) {
            this.renderer = renderer;
            this.gl = this.renderer.context;

            var aspect = window.innerWidth / window.innerHeight;
            this.camera = new THREE.PerspectiveCamera(70, aspect, 0.001, 2000);

            this.roomState = new verse.RoomState();

            this.controls = new VerseControls(this.camera, this.roomState);

            window.addEventListener('resize', this.onWindowResize);
            this.multiUserClient = new multi.MultiUserClient(this.roomState, this.controls);

            this.userInterface = new ui.UserInterface(this);

        }

        update() {

            this.controls.update();
            this.multiUserClient.update();

            var intersectedPortal = this.controls.checkPortalIntersection(this.roomState.currentRoom);
            if (intersectedPortal) {
                console.log("Moved through portal!");
                this.moveThroughPortal(intersectedPortal);
            }

            this.render();

        }

        render() {
            this.roomState.currentRoom.render(this.gl, this.renderer, this.camera);
        }

        moveThroughPortal(portal: Portal) {

            var otherEndPortal = portal.toPortal;

            //Ensure that the portal that was just moved through points to the portal we entered
            // (So we could turn around and go back)
            otherEndPortal.setToPortal(portal, this.roomState.currentRoom);
            otherEndPortal.toPortal

            //TODO remove the necessity of moving portals around to match rotation.
            //Requires fix of rendering
            otherEndPortal.rotation.setFromQuaternion(portal.quaternion);
            otherEndPortal.rotateY(Math.PI);

            var roomId = portal.toRoomId;
            var room = this.roomState.roomDictionary[roomId];
            var where = portal.getPortalViewMatrix(this.controls.camera.matrixWorld);
            this.roomState.switchToRoom(room, where);
        }

        onWindowResize = (event) => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }



    }


}