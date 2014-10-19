/// <reference path="../typings/threejs/three.d.ts"/>

class Greeter {
    element: HTMLElement;
    span: HTMLElement;
    timerToken: number;

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }

    start() {
        this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);
    }

    stop() {
        clearTimeout(this.timerToken);
    }

}




window.onload = () => {
    ////////////////////
    // POINTER LOCK
    ////////////////////

    var blocker = document.getElementById('blocker');
    var instructions = document.getElementById('instructions');

    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    if (havePointerLock) {

        var element = document.body;

        var pointerlockchange = function (event) {

            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {

                controls.enabled = true;

                blocker.style.display = 'none';

            } else {

                controls.enabled = false;

                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';

                instructions.style.display = '';

            }

        }

		    var pointerlockerror = function (event) {

            instructions.style.display = '';

        }

		    // Hook pointer lock state change events
		    document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

        instructions.addEventListener('click', function (event) {

            instructions.style.display = 'none';

            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

            if (/Firefox/i.test(navigator.userAgent)) {

                var fullscreenchange = function (event) {

                    if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

                        document.removeEventListener('fullscreenchange', fullscreenchange);
                        document.removeEventListener('mozfullscreenchange', fullscreenchange);

                        element.requestPointerLock();
                    }

                }

		            document.addEventListener('fullscreenchange', fullscreenchange, false);
                document.addEventListener('mozfullscreenchange', fullscreenchange, false);

                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

                element.requestFullscreen();

            } else {

                element.requestPointerLock();

            }

        }, false);

    } else {

        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

    }

    ////////////////////
    // SCENES AND STUFF
    ////////////////////

    var time = Date.now();

    var renderer;

    var controls;
    var camera;
    var cameraObject;

    var fromScene;
    var toScene;
    var stencilScene;
    var fromPortal;
    var toPortal;

    var portalMaterial;
    var portalGeometry;

    var linehelper;

    // caches
    var originalCameraMatrixWorld;

    init();
    tick();

    function init() {
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);

        fromScene = new THREE.Scene();
        toScene = new THREE.Scene();
        stencilScene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x000000);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.autoClear = false;

        document.body.appendChild(renderer.domElement);

        portalGeometry = new THREE.PlaneGeometry(20, 20);
        portalMaterial = new THREE.MeshBasicMaterial();

        setupFromScene();
        setupToScene();
        setupStencilScene();

        createControls();

        window.addEventListener('resize', onWindowResize, false);
    }

    function createControls() {
        controls = new THREE.PointerLockControls(camera);
        cameraObject = controls.getObject();
        cameraObject.position.z = 30;
        cameraObject.matrixAutoUpdater = true;

        fromScene.add(cameraObject);
    }

    function swap() {
        fromScene.remove(cameraObject);
        toScene.add(cameraObject);
        fromScene = toScene;
    }


    function setupFromScene() {
        fromPortal = new THREE.Mesh(portalGeometry, portalMaterial);
        fromPortal.position.y = 10;
        fromPortal.updateMatrix(true);

        //    fromScene.add(fromPortal);

        var grid = new THREE.GridHelper(100, 10);

        fromScene.add(grid);
    }

    function setupToScene() {
        toPortal = new THREE.Mesh(portalGeometry, portalMaterial);
        toPortal.position.y = 10;
        toPortal.rotateY(Math.PI);
        toPortal.updateMatrix(true);

        //    toScene.add(toPortal);

        var g = new THREE.CubeGeometry(100, 20, 10);
        var m = new THREE.MeshPhongMaterial();
        var cube = new THREE.Mesh(g, m);

        cube.position.set(0, 10, -95);

        toScene.add(cube);

        var sphereGeom = new THREE.SphereGeometry(1000);
        var sphereMat = new THREE.MeshBasicMaterial({ color: 0x202020 });
        var sphere = new THREE.Mesh(sphereGeom, sphereMat);

        sphereMat.side = THREE.BackSide;

        toScene.add(sphere);

        var light = new THREE.DirectionalLight(0xffffff, 2);
        var light2 = new THREE.AmbientLight(0x303030);

        light.position.set(1, 1, 1).normalize();

        toScene.add(light);
        toScene.add(light2);

        var grid = new THREE.GridHelper(100, 10);

        grid.setColors(0xff0000, 0xcc0000);

        toScene.add(grid);
    }

    function setupStencilScene() {
        var p = fromPortal.clone();
        //    p.scale.set(0.95, 0.95, 0.95);
        //    p.position.z += 0.01;
        p.updateMatrixWorld(true);

        stencilScene.add(p);
    }

    function tick() {
        requestAnimationFrame(tick);

        update();
        render();

        time = Date.now();
    }

    function update() {
        controls.update(Date.now() - time);
    }

    function render() {
        var gl = renderer.context;

        camera.updateMatrixWorld(true);
        originalCameraMatrixWorld = camera.matrixWorld.clone();

        // 1: clear scene (autoClear is disabled)
        renderer.clear(true, true, true);

        // 2: draw portal mesh into stencil buffer
        gl.colorMask(false, false, false, false);
        gl.depthMask(false);
        gl.enable(gl.STENCIL_TEST);
        gl.stencilMask(0xFF);
        gl.stencilFunc(gl.NEVER, 0, 0xFF);
        gl.stencilOp(gl.INCR, gl.KEEP, gl.KEEP);

        renderer.render(stencilScene, camera);

        gl.colorMask(true, true, true, true);
        gl.depthMask(true);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

        // 3: draw toScene on scencil
        renderer.clear(false, true, false);

        gl.stencilFunc(gl.LESS, 0, 0xff);

        camera.matrixWorld = getPortalViewMatrix(camera, fromPortal, toPortal);

        renderer.render(toScene, camera);

        gl.disable(gl.STENCIL_TEST);

        renderer.clear(false, false, true);

        // 4: draw fromScene.
        camera.matrixWorld = originalCameraMatrixWorld;

        // clear the depth buffer and draw the fromPortal mesh into it
        renderer.clear(false, true, false);

        gl.colorMask(false, false, false, false);
        gl.depthMask(true);

        renderer.render(stencilScene, camera);

        // draw the actual scene
        gl.colorMask(true, true, true, true);
        gl.depthMask(false); // gl.enable(gl.DEPTH_TEST) ?

        renderer.render(fromScene, camera);
    }

    function getPortalViewMatrix(cam, src, dst) {
        return dst.matrix.clone().multiply(cam.matrixWorld);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }
};