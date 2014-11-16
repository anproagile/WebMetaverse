module wm.verse {

    export class Portal extends THREE.Mesh {
        
        stencilScene: THREE.Scene;
        toRoomId: string;

        toScene: THREE.Scene;
        toPortal: Portal;


        constructor(toRoomId: string) {
            this.toRoomId = toRoomId;
            var geom = new THREE.PlaneGeometry(20, 60);
            //var geom = new THREE.CylinderGeometry(20, 20, 50);
            var mat = new THREE.MeshBasicMaterial();
            //mat.side = THREE.DoubleSide;
            super(geom, mat);

            this.stencilScene = new THREE.Scene();

            this.geometry.computeFaceNormals();
            var p = this.clone();
            p.updateMatrixWorld(true);
            this.stencilScene.add(this);
            
        }

        setToPortal(toPortal: Portal, toRoom: wm.room.Room) {
            this.toPortal = toPortal;
            this.toScene = toRoom.scene;
            this.toRoomId = toRoom.id;
            this.updateStencilSceneMatrix();
        }

        isLinked(): boolean {
            return this.toScene ? true : false;
        }



        public render(gl: WebGLRenderingContext, renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {

            if (!this.toScene) { //Can't draw this portal if the room it points to isn't loaded yet
                return;
            }
            var originalCameraMatrixWorld = camera.matrixWorld.clone();

            // 1: draw portal mesh into stencil buffer
            gl.colorMask(false, false, false, false);
            gl.depthMask(true);
            gl.enable(gl.STENCIL_TEST);
            gl.stencilMask(0xFF);
            gl.stencilFunc(gl.NEVER, 0, 0xFF);
            gl.stencilOp(gl.INCR, gl.KEEP, gl.KEEP);

            renderer.render(this.stencilScene, camera);

            gl.colorMask(true, true, true, true);
            gl.depthMask(true);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

            // 2: draw toScene on stencil
            renderer.clear(false, true, false);

            gl.stencilFunc(gl.LESS, 0, 0xff);
            
            camera.matrixWorld = this.getPortalViewMatrix(camera.matrixWorld);

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

        getPortalViewMatrix(originalView: THREE.Matrix4) {
            var t = new THREE.Matrix4().makeTranslation(this.position.x - this.toPortal.position.x, this.position.y - this.toPortal.position.y, this.position.z - this.toPortal.position.z);
            t.getInverse(t);
            return t.multiply(originalView);

        }

        /**
        * Raycast from `from` to `to`, to check if avatar has to be teleported
        * @return an intersection with the portal mesh was made.
        */
        checkIntersection(from: THREE.Vector3, to: THREE.Vector3): boolean {

            var direction = new THREE.Vector3().copy(to).sub(from);

            var caster = new THREE.Raycaster();
            caster.precision = 0.00001;
            caster.set(from, direction);

            var intersect = caster.intersectObject(this);

            for (var i = 0; i < intersect.length; i++) {
                if (intersect[i].distance < direction.length()) {
                    return true;
                }
            }
            return false;
        }

        updateStencilSceneMatrix() {
            this.stencilScene.updateMatrix();
            this.stencilScene.updateMatrixWorld(true);
        }

    }
}