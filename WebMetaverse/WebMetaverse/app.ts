/// <reference path="Scripts/typings/threejs/three.d.ts"/>
/// <reference path="pointerlock.ts"/>

module WebMetaverse {
    class WebVR {

        time: number = Date.now();
        renderer: THREE.WebGLRenderer;
        camera: THREE.PerspectiveCamera;
        cameraObject: any;
        controls: any;
        originalCameraMatrixWorld: any;

        scenes: THREE.Scene[];
        fromScene: THREE.Scene;
        fromPortal: Portal;
        toPortal: Portal;
        toScene: THREE.Scene;

        constructor() {

            this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);

            this.createRenderer();

            document.body.appendChild(this.renderer.domElement);

            this.createWorld();
            this.createControls();
            window.addEventListener('resize', () => this.onWindowResize, false);
        }

        createRenderer() {
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setClearColor(0x000000);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.autoClear = false;



        }

        createControls() {
            this.controls = new THREE.PointerLockControls(this.camera);
            this.cameraObject = this.controls.getObject();
            this.cameraObject.position.z = 30;
            this.cameraObject.matrixAutoUpdater = true;
            new PointerLock(this.controls);
            this.fromScene.add(this.cameraObject);
        }

        createWorld() {
            this.setupFromScene();
            this.setupToScene();
            this.setupPortals();
        }

        setupFromScene() {
            this.fromScene = new THREE.Scene();
            var grid = new THREE.GridHelper(100, 10);
            this.fromScene.add(grid);

            var g = new THREE.CubeGeometry(100, 20, 10);
            var m = new THREE.MeshNormalMaterial();
            var cube = new THREE.Mesh(g, m);
            cube.position.set(0, 10, -95);
            this.fromScene.add(cube);

        }

        setupToScene() {
            this.toScene = new THREE.Scene();
            var g = new THREE.CubeGeometry(100, 20, 10);
            var m = new THREE.MeshPhongMaterial();
            var cube = new THREE.Mesh(g, m);
            cube.position.set(0, 10, -95);
            this.toScene.add(cube);
            var sphereGeom = new THREE.SphereGeometry(1000);
            var sphereMat = new THREE.MeshBasicMaterial({ color: 0x202020 });
            var sphere = new THREE.Mesh(sphereGeom, sphereMat);
            sphereMat.side = THREE.BackSide;
            this.toScene.add(sphere);
            var light = new THREE.DirectionalLight(0xffffff, 2);
            var light2 = new THREE.AmbientLight(0x303030);
            light.position.set(1, 1, 1).normalize();
            this.toScene.add(light);
            this.toScene.add(light2);
            var grid = new THREE.GridHelper(100, 10);
            grid.setColors(0xff0000, 0xcc0000);
            this.toScene.add(grid);
        }

        setupPortals() {
            this.toPortal = new Portal(this.fromScene);
            this.fromPortal = new Portal(this.toScene);
            this.fromPortal.toPortal = this.toPortal;
            this.toPortal.toPortal = this.fromPortal;

            
            this.toPortal.updateMatrix();

            this.fromPortal.rotateY(0.25 * Math.PI);
            this.fromPortal.position.y = 15;
            this.fromPortal.updateMatrix();

        }




        onWindowResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        tick = () => {
            
            this.update();
            this.render();
            this.time = Date.now();

            requestAnimationFrame(this.tick);
        }

        update() {
            this.controls.update(Date.now() - this.time);
        }

        render() {
            var gl = this.renderer.context;
            this.camera.updateMatrixWorld(true);
            
            this.renderer.clear(true, true, true); //Clear scene, autoclear is disabled.
            this.fromPortal.draw(gl, this.renderer, this.camera);
            
            gl.colorMask(true, true, true, true);
            gl.depthMask(false); // gl.enable(gl.DEPTH_TEST) ?
            this.renderer.render(this.fromScene, this.camera);



        }


    }


    class Portal extends THREE.Mesh{

        stencilScene: THREE.Scene;
        toScene: THREE.Scene;
        toPortal: Portal;


        constructor(toScene: THREE.Scene) {
            super(new THREE.PlaneGeometry(20, 40), new THREE.MeshBasicMaterial());
            this.stencilScene = new THREE.Scene();

            this.toScene = toScene;

            var p = this.clone();
            p.updateMatrixWorld(true);
            this.stencilScene.add(this);
        }

        public draw(gl: any, renderer: any, camera: any) { //Remixed from http://gamedev.stackexchange.com/questions/71510/first-person-camera-world-matrix-issue-in-three-js-and-webgl

            var originalCameraMatrixWorld = camera.matrixWorld.clone();

            // 1: draw portal mesh into stencil buffer
            gl.colorMask(false, false, false, false);
            gl.depthMask(false);
            gl.enable(gl.STENCIL_TEST);
            gl.stencilMask(0xFF);
            gl.stencilFunc(gl.NEVER, 0, 0xFF);
            gl.stencilOp(gl.INCR, gl.KEEP, gl.KEEP);

            renderer.render(this.stencilScene, camera);

            gl.colorMask(true, true, true, true);
            gl.depthMask(true);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

            // 2: draw toScene on scencil
            renderer.clear(false, true, false);

            gl.stencilFunc(gl.LESS, 0, 0xff);

            camera.matrixWorld = this.getPortalViewMatrix(camera, this.toPortal);
            renderer.render(this.toScene, camera);

            gl.disable(gl.STENCIL_TEST);
            renderer.clear(false, false, true);

            //Draw stencil scene
            camera.matrixWorld = originalCameraMatrixWorld;
            // clear the depth buffer and draw the fromPortal mesh into it
            renderer.clear(false, true, false);
            gl.colorMask(false, false, false, false);
            gl.depthMask(true);
            renderer.render(this.stencilScene, camera);


        }
        
        getPortalViewMatrix(cam, dst) {
             return dst.matrix.clone().multiply(cam.matrixWorld);
        }

    }

    window.onload = () => {
        var webvr = new WebVR();
        webvr.tick();
    };
}



