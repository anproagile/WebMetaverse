class Portal extends THREE.Mesh {

    stencilScene: THREE.Scene;
    toScene: THREE.Scene;
    toPortal: Portal;


    constructor(toScene: THREE.Scene) {
        //super(new THREE.PlaneGeometry(20, 40), new THREE.MeshBasicMaterial());
        //super(new THREE.SphereGeometry(40, 10, 10), new THREE.MeshBasicMaterial());
        var mat = new THREE.MeshBasicMaterial();
        mat.side = THREE.DoubleSide;
        super(new THREE.SphereGeometry(40, 16, 16), mat);
        this.stencilScene = new THREE.Scene();

        this.toScene = toScene;

        var p = this.clone();
        p.updateMatrixWorld(true);
        this.stencilScene.add(this);
    }
    public draw_(gl: WebGLRenderingContext, renderer: THREE.WebGLRenderer, camera: any) {

        var mat = camera.matrixWorld.clone();

        gl.colorMask(false, false, false, false);
        gl.depthMask(false);

        gl.stencilFunc(gl.NEVER, 0, 0xff);
        gl.stencilOp(gl.INCR, gl.KEEP, gl.KEEP);

        //Draw stencil pattern
        gl.clear(gl.STENCIL_BUFFER_BIT);

        renderer.render(this.stencilScene, camera);
        gl.colorMask(true, true, true, true);
        gl.depthMask(true);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

        // Fill 1 or more
        gl.stencilFunc(gl.LEQUAL, 1, 0xff);

        renderer.clear(false, true, false);


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

        camera.matrixWorld = this.getPortalViewMatrix(camera.matrixWorld, this, this.toPortal);

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

    getPortalViewMatrix(originalView: THREE.Matrix4, src: THREE.Mesh, dst: THREE.Mesh) {
        var mat = new THREE.Matrix4().getInverse(dst.matrix.clone().makeRotationFromEuler(src.rotation));
        return mat.multiply(originalView);
    }

    /**
    * Raycast from `from` to `direction`
    * @return an intersection with the portal mesh was made.
    */
    checkIntersection(from: THREE.Vector3, direction: THREE.Vector3): boolean{

        var caster = new THREE.Raycaster();
        caster.set(from, direction);

        var intersect = caster.intersectObject(this);

        for (var i = 0; i < intersect.length; i++) {
            if (intersect[i].distance < direction.length()) {
                return true;
            }
        }
        return false;
    }


}