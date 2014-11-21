/// <reference path="../typings/threejs/three.d.ts"/>
/// <reference path="../verse/portal.ts"/>

module wm.room {

    import Portal = wm.verse.Portal;

    export class Room {

        static EmptyRoom: Room = new Room("EMPTYROOM");

        portals: Portal[];
        entrancePortal: Portal;

        scene: THREE.Scene;
        id: string;

        constructor(id: string) {
            this.scene = new THREE.Scene();
            this.portals = [];
            this.id = id;
        }

        render(gl: WebGLRenderingContext, renderer: THREE.WebGLRenderer, camera) {
            //0 Clear the previous frame
            renderer.clear(true, true, true);
            

            for (var i = 0; i < this.portals.length; i++) {
                this.portals[i].render(gl, renderer, camera);
            }
            //9 Disable the stencil test, disable drawing to the color buffer, 
            // and enable drawing to the depth buffer.
            gl.disable(gl.STENCIL_TEST);
            gl.colorMask(false, false, false, false);
            gl.depthMask(true);

            // 10 Clear the depth buffer.
            renderer.clear(false, true, false);

            // 11 Draw the portal frame once again, 
            // this time to the depth buffer which was just cleared.
            for (var i = 0; i < this.portals.length; i++) {
                renderer.render(this.portals[i].stencilScene, camera);
            }

            // 12 Enable the color buffer again.
            gl.colorMask(true, true, true, true);
            // 13 Draw the whole scene with the regular camera.
            renderer.render(this.scene, camera);
            
            // 14 ???

            // 15 profit
        }

        add(object: THREE.Object3D) {
            this.scene.add(object);
        }

        addPortal(portal: Portal): number {
            return this.portals.push(portal);
        }

        remove(object: THREE.Object3D) {
            this.scene.remove(object);
        }

        addEntrancePortal() {
            if (this.entrancePortal) {
                throw 'Room already has an entrance portal!';
            }
            var portal = new Portal('ENTRANCE');

            

            //this.add(portal);
            this.entrancePortal = portal;
            this.portals.push(portal);
        }


    }
}