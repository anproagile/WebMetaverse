/// <reference path="Scripts/typings/threejs/three.d.ts"/>
/// <reference path="pointerlock.ts"/>
/// <reference path="portal.ts"/>
/// <reference path="Scripts/typings/WebGL.d.ts"/>

module WebMetaverse {
    class WebVR {

        time: number = Date.now();
        renderer: THREE.WebGLRenderer;
        camera: THREE.PerspectiveCamera;
        cameraObject: THREE.Object3D;
        prevPos: THREE.Vector3; //Camera position previous frame
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
           // this.cameraObject.matrixAutoUpdater = true;
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

            var g = new THREE.BoxGeometry(100, 20, 10);
            var m = new THREE.MeshNormalMaterial();
            var cube = new THREE.Mesh(g, m);
            cube.position.set(0, 10, -95);
            this.fromScene.add(cube);

        }

        setupToScene() {
            this.toScene = new THREE.Scene();
            var g = new THREE.BoxGeometry(60, 20, 10);
            var m = new THREE.MeshPhongMaterial();
            var cube = new THREE.Mesh(g, m);
            cube.position.set(0, 10, -95);
            this.toScene.add(cube);

            var sphereGeom = new THREE.SphereGeometry(10);
            var sphereMat = new THREE.MeshBasicMaterial({ color: 0x20F020 });
            var sphere = new THREE.Mesh(sphereGeom, sphereMat);
            sphere.position.x = 50;
            sphere.updateMatrix();
            sphereMat.side = THREE.BackSide;
            this.toScene.add(sphere);

            var sphereMat2 = new THREE.MeshBasicMaterial({ color: 0xF0F020 });
            var sphere2 = new THREE.Mesh(sphereGeom, sphereMat2);
            sphere2.position.x = -50;
            sphere2.updateMatrix();
            this.toScene.add(sphere2);






            var light = new THREE.DirectionalLight(0xffffff, 2);
            var light2 = new THREE.AmbientLight(0x303030);
            light.position.set(1, 1, 1).normalize();
            this.toScene.add(light);
            this.toScene.add(light2);
            var grid = new THREE.GridHelper(100, 10);
            grid.setColors(0xff0000, 0x00aacc);
            this.toScene.add(grid);
        }

        setupPortals() {

            this.toPortal = new Portal(this.fromScene);

            this.fromPortal = new Portal(this.toScene);

            this.fromPortal.toPortal = this.fromPortal;
            this.toPortal.toPortal = this.toPortal;

            //this.toPortal.rotateY(-0.25 * Math.PI);
            this.toPortal.position.x = 5;
            this.toPortal.updateMatrix();

           // this.fromPortal.rotateY(0.5 * Math.PI);
           // this.fromPortal.rotateX(-Math.PI);
            //this.fromPortal.rotateY(-0.3)
            this.fromPortal.position.x = -5;
            this.fromPortal.position.y = 5;
            this.fromPortal.updateMatrix();

        }




        onWindowResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        tick = () => {
            this.camera.updateMatrixWorld(true);
            this.update();
            this.render();
            this.time = Date.now();

            requestAnimationFrame(this.tick);
        }

        update() {
            this.controls.update(Date.now() - this.time);
            this.checkPortalIntersection();
        }


        render() {
            var gl: WebGLRenderingContext = this.renderer.context;
            
            this.renderer.clear(true, true, true); //Clear scene, autoclear is disabled.
            //this.toPortal.draw(gl, this.renderer, this.camera);
            this.fromPortal.draw(gl, this.renderer, this.camera);
        
            gl.colorMask(true, true, true, true);
            gl.depthMask(false);

            this.renderer.render(this.fromScene, this.camera);


        }

        checkPortalIntersection() {

            var caster = new THREE.Raycaster();
            var curPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld);


            if (this.prevPos) {
                var dir = new THREE.Vector3().copy(curPos).sub(this.prevPos);
                caster.set(this.prevPos, dir);

                var intersect = caster.intersectObject(this.fromPortal);

                if (intersect.length > 0) {
                    for (var i = 0; i < intersect.length; i++) {
                        if (intersect[i].distance < dir.length()) {
                            console.log(intersect[i]);
                        }
                    }
                }
            }

            this.prevPos = curPos;
        }



    }


   

    window.onload = () => {
        var webvr = new WebVR();
        webvr.tick();
    };
}



