/// <reference path="typings/threejs/three.d.ts"/>

module WM {
    export class Room {

        portals: Portal[];
        scene: THREE.Scene;

        constructor() {
            this.scene = new THREE.Scene();
            this.portals = [];

        }

        draw(gl: WebGLRenderingContext, renderer: THREE.WebGLRenderer, camera) {

            renderer.clear(true, true, true);
            for (var i = 0; i < this.portals.length; i++) {
                this.portals[i].draw(gl, renderer, camera);
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

    }
}