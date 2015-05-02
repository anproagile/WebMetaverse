module wm.room {

    class Sphere extends wm.room.Element {

        constructor(htmlElement?: HTMLElement) {
            super();

            var segmentsAttr = htmlElement.getAttribute('segments') || 6;
            var segments = Number(segmentsAttr);

            var geometry = new THREE.SphereGeometry(0.5, segments, segments);
            var material = new THREE.MeshLambertMaterial({
                color: 0xEEEEEE
            });

            this.threeObject = new THREE.Mesh(geometry, material);
            this.setTransformFromElement();
        }

    }

}