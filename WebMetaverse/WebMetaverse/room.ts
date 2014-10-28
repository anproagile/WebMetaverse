/// <reference path="Scripts/typings/threejs/three.d.ts"/>
/// <reference path="pointerlock.ts"/>
/// <reference path="portal.ts"/>
/// <reference path="Scripts/typings/WebGL.d.ts"/>


class Room{

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

class JanusRoomLoader {

    constructor() {

    }
    
}

class XMLParser {

    static parseDocument(xmlStr) {

        if (typeof DOMParser != "undefined") {
                return (new DOMParser()).parseFromString(xmlStr, "text/xml");
        }
        else if (typeof ActiveXObject != "undefined" &&
            new ActiveXObject("Microsoft.XMLDOM")) {

                var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(xmlStr); return xmlDoc;

        }
        else {
            throw new Error("No XML parser found");
        }
    }
}