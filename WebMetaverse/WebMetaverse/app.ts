/// <reference path="verse/verseclient.ts" />
/// <reference path="typings/threejs/three.d.ts"/>
/// <reference path="network/networkclient.ts"/>
/// <reference path="verse/portal.ts"/>
/// <reference path="pointerlock.ts"/>
/// <reference path="pointerlockcontrols.ts"/>
/// <reference path="room/room.ts" />

var webmetaverse: wm.WebMetaverse = null;

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

        }

        private createRenderer(): THREE.WebGLRenderer {
            var renderer = new THREE.WebGLRenderer();
            //renderer.setClearColor(0xf0ff00, 1000);
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
        webvr.client.roomState.loadRoom('debug1');
        webvr.client.roomState.loadRoom('debug2');


        webvr.tick();
        webvr.client.multiUserClient.networkClient.joinRoom();
        
        
        webvr.client.roomState.switchToRoomWithId('debug1');
    };
}



