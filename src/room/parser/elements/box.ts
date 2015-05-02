module wm.room {

    class Box extends wm.room.Element{

        constructor(htmlElement?: HTMLElement) {
            super();

            var geometry = new THREE.BoxGeometry(1, 1, 1);
            var material = new THREE.MeshLambertMaterial({
                color: 0xEEEEEE
            });

            this.threeObject = new THREE.Mesh(geometry, material);
            this.setTransformFromElement();
        }


    }

}