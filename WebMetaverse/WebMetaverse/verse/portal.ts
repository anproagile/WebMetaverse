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

            // 1 Disable drawing to the color buffer and the depth buffer, 
            // but enable writing to the stencil buffer.
            gl.colorMask(false, false, false, false);
            gl.depthMask(false);
            gl.enable(gl.STENCIL_TEST);
            gl.stencilMask(0xFF);
            

            // 2 Set the stencil operation to GL_INCR on sfail,
            // meaning that the stencil value will be incremented when the stencil test fails.
            gl.stencilOp(gl.INCR, gl.KEEP, gl.KEEP);

            // 3 Set the stencil function to GL_NEVER, 
            // which makes sure that the stencil test always fails on every pixel drawn.
            gl.stencilFunc(gl.NEVER, 0, 0xFF);

            // 4 Draw the portal’s frame. At this point the stencil buffer is filled with zero’s
            // on the outside of the portal’s frame and one’s on the inside.
            renderer.render(this.stencilScene, camera);

            // 5 Generate the virtual camera’s view matrix using the view frustum clipping method.
            camera.matrixWorld = this.getPortalViewMatrix(camera.matrixWorld);

            // 6 Disable writing to the stencil buffer, 
            // but enable drawing to the color buffer and the depth buffer.
            gl.stencilMask(0x00);
            gl.colorMask(true, true, true, true);
            gl.depthMask(true);

            // 7 Set the stencil function to GL_LEQUAL with reference value 1. 
            // This will only draw where the stencil value is greater than or equal to 1, 
            // which is inside the portal frame.
            gl.stencilFunc(gl.LEQUAL, 1, 0xff);

            // 8 Draw the scene using the virtual camera from step 5. 
            // This will only draw inside of the portal’s frame because of the stencil test.
            renderer.render(this.toScene, camera);

            
            camera.matrixWorld = originalCameraMatrixWorld;

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

            //Portal doesn't have a target
            if (!this.toPortal) return false;

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