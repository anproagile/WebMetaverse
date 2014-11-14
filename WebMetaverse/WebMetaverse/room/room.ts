/// <reference path="../typings/threejs/three.d.ts"/>
/// <reference path="../verse/portal.ts"/>

module WM.Room {

    import Portal = WM.Verse.Portal;

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

            renderer.clear(true, true, true);
            for (var i = 0; i < this.portals.length; i++) {
                this.portals[i].render(gl, renderer, camera);
            }


            gl.colorMask(true, true, true, true);
            gl.depthMask(false);

            renderer.render(this.scene, camera);

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
            this.add(portal);
            this.entrancePortal = portal;
        }


    }
}