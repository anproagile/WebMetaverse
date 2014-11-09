module WM {

    export class Portal extends THREE.Mesh {
        
        stencilScene: THREE.Scene;
        toScene: THREE.Scene;
        toRoom: Room;

        toPortal: Portal;


        constructor(toRoom: Room) {
            var geom = new THREE.PlaneGeometry(20, 60);
            var mat = new THREE.MeshBasicMaterial();
            //mat.side = THREE.DoubleSide;
            super(geom, mat);

            this.stencilScene = new THREE.Scene();

            this.toScene = toRoom.scene;
            this.toRoom = toRoom;
            this.geometry.computeFaceNormals();
            var p = this.clone();
            p.updateMatrixWorld(true);
            this.stencilScene.add(this);
        }

        public draw(gl: WebGLRenderingContext, renderer: THREE.WebGLRenderer, camera: any) {

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
            //camera.matrixWorld = this.getPortalViewMatrix1(camera.matrixWorld);
            //camera.matrixWorld = this.getPortalViewMatrix2(camera.matrixWorld); 

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

        //Attempt 1
        //Based on http://en.wikibooks.org/wiki/OpenGL_Programming/Mini-Portal , see section "Building a new camera", first code.
        //Commented out Y rotation, as without it is already very wrong.
        getPortalViewMatrix1(camera: THREE.Camera) {
            var inverse_view_to_source = new THREE.Matrix4().getInverse(camera.matrixWorld).multiply(this.matrix);
            var new_mat = this.toPortal.matrix.clone().multiply(inverse_view_to_source);
            var rot = new THREE.Matrix4().makeRotationY(Math.PI);
            // new_mat.rotateY(3.14);
            //return new_mat;
            return rot.multiply(new_mat);
        }

        //Attempt 2
        //Based on http://en.wikibooks.org/wiki/OpenGL_Programming/Mini-Portal , see section "Building a new camera", first code.
        //Commented out Y rotation, as without it is already very wrong.
        getPortalViewMatrix2(originalView: THREE.Matrix4) {
            var mv = originalView.multiply(this.matrix);
            var portalCam = mv
            //.multiply(new THREE.Matrix4().makeRotationY(Math.PI))
                .multiply(new THREE.Matrix4().getInverse(this.toPortal.matrix));

            return portalCam;
        }

        //Wrong, but the most right attempt, syncs up the two different scenes, 
        //but doesn't take into account goal portal position, rotation
        //Only works with portals on (0,0,0), unrotated
        getPortalViewMatrix(originalView: THREE.Matrix4) {
            return this.toPortal.matrix.clone().multiply(originalView);
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