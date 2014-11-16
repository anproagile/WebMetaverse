﻿/// <reference path="verse/verseclient.ts" />
/// <reference path="typings/threejs/three.d.ts"/>
/// <reference path="network/networkclient.ts"/>
/// <reference path="verse/portal.ts"/>
/// <reference path="pointerlock.ts"/>
/// <reference path="pointerlockcontrols.ts"/>
/// <reference path="room/room.ts" />
/// <reference path="verse/roomcoordinator.ts" />
/// <reference path="multi/remoteavatarwatcher.ts" />

var webmetaverse: wm.WebMetaverse = null;
var nc;

module wm {

    export function urlToId(url: string): string {
        return btoa(url);
    }

    export class WebMetaverse {

        doEndOfTick: { (): void; }[] = [];

        client: verse.VerseClient;

        constructor() {
            webmetaverse = this;

            var renderer = this.createRenderer();
            document.body.appendChild(renderer.domElement);

            this.client = new verse.VerseClient(renderer);
            nc = this.client.networkClient;
            
            

        }

        private createRenderer(): THREE.WebGLRenderer {
            var renderer = new THREE.WebGLRenderer();
            renderer.setClearColor(0x000000);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.autoClear = false;

            return renderer;
        }

        tick = () => {
            this.client.update();
            requestAnimationFrame(this.tick);

            for (var i = 0; i < this.doEndOfTick.length; i++) {
                this.doEndOfTick[i]();
            }
            this.doEndOfTick = [];
        }


    }


  
    window.onload = () => {
        var webvr = new WebMetaverse();
        webvr.client.roomCoordinator.loadRoom('debug1');
        webvr.client.roomCoordinator.switchToRoomWithId('debug1');
        
        webvr.tick();
        webvr.client.networkClient.joinRoom();
        webvr.client.roomCoordinator.loadRoom('debug2');
        
        
    };
}



