/// <reference path="Scripts/typings/threejs/three.d.ts"/>
/// <reference path="pointerlock.ts"/>
/// <reference path="portal.ts"/>
/// <reference path="Scripts/typings/WebGL.d.ts"/>


class Room{

    portals: Portal[];
    scene: THREE.Scene;

    constructor() { }

    draw(gl: WebGLRenderingContext, renderer: THREE.WebGLRenderer, camera) {

        for (var i = 0; i < this.portals.length; i++) {
            this.portals[i].draw(gl, renderer, camera);
        }

        renderer.clear(true, true, true);
        gl.colorMask(true, true, true, true);
        gl.depthMask(false);

        renderer.render(this.scene, camera);

    }




}