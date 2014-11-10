interface Document {
    pointerLockElement: any;
    mozPointerLockElement: any;
    webkitPointerLockElement: any;
    fullscreenElement: any;
    mozFullscreenElement: any;
    mozFullScreenElement: any;
    webkitFullscreenElement: any;
}
interface HTMLElement {
    requestPointerLock: any;
    mozRequestPointerLock: any;
    webkitRequestPointerLock: any;
    requestFullScreen: any;
    requestFullscreen: any;
    mozRequestFullScreen: any;
    mozRequestFullscreen: any;
    webkitRequestFullscreen: any;
}

declare module THREE {
    export class PointerLockControls {
        constructor(a: any);
    }
}

module WM {
    export class PointerLock {

        blocker: HTMLElement;
        instructions: HTMLElement;
        controls: any;

        constructor(controls: any) {
            this.blocker = document.getElementById('blocker');
            this.instructions = document.getElementById('instructions');
            this.controls = controls;
            this.init();
        }

        init() {

            var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

            if (havePointerLock) {

                var element = document.body;

                var pointerlockchange = event => {
                    if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {

                        this.controls.enabled = true;

                        this.blocker.style.display = 'none';

                    } else {

                        this.controls.enabled = false;

                        this.blocker.style.display = '-webkit-box';
                        this.blocker.style.display = '-moz-box';
                        this.blocker.style.display = 'box';

                        this.instructions.style.display = '';

                    }

                }

		    var pointerlockerror = function (event) {

                    this.instructions.style.display = '';
                    console.log("Pointer lock error!");
                }

		    // Hook pointer lock state change events
		    document.addEventListener('pointerlockchange', pointerlockchange, false);
                document.addEventListener('mozpointerlockchange', pointerlockchange, false);
                document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

                document.addEventListener('pointerlockerror', pointerlockerror, false);
                document.addEventListener('mozpointerlockerror', pointerlockerror, false);
                document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

                this.instructions.addEventListener('click', e => {
                    // Ask the browser to lock the pointer
                    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                    element.requestPointerLock();
                }, false);

            } else {

                this.instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

            }
        }


    }
}