module wm.room {

    // Base element class
    // Based on SceneVR implementation by bnolan

    export class Element {

        public threeObject: THREE.Object3D = null;
        public htmlElement: HTMLElement = null;


        constructor(htmlElement?: HTMLElement) {
            this.htmlElement = htmlElement;
        }

        protected setPositionFromElement() {
            var positionAttr: String = this.htmlElement.getAttribute('position');
            var position = positionAttr ? ParseUtil.parseVector(positionAttr) : new THREE.Vector3(0, 0, 0);

            this.threeObject.position.copy(position);
        }

        protected setScaleFromElement() {
            var scaleAttr: String = this.htmlElement.getAttribute('scale');
            var scale = scaleAttr ? ParseUtil.parseVector(scaleAttr) : new THREE.Vector3(1, 1, 1);

            this.threeObject.scale.copy(scale);
        }

        protected setRotationFromElement() {
            var rotationAttr: String = this.htmlElement.getAttribute('scale');
            var rotationEuler = rotationAttr ? ParseUtil.parseEuler(rotationAttr) : new THREE.Euler(0, 0, 0);

            this.threeObject.quaternion.setFromEuler(rotationEuler);
        }


        /** 
        * Sets basic transform properties from element attributes 
        * (position, rotation, scale)
        */
        protected setTransformFromElement() {
            this.setPositionFromElement();
            this.setRotationFromElement();
            this.setScaleFromElement();
        }


    }


    export class ParseUtil{

        public static parseVector(value: String): THREE.Vector3 {
            var vector = new THREE.Vector3().fromArray(value.split(' ').map(parseFloat));

            if (isFinite(vector.length())) {
                return vector;
            } else {
                throw new Error('Invalid vector string');
            }
        }


        public static parseEuler(value: String): THREE.Euler {
            var euler = new THREE.Euler().fromArray(value.split(' ').map(parseFloat));

            if (isFinite(euler.x) && isFinite(euler.y) && isFinite(euler.z)) {
                return euler;
            } else {
                throw new Error('Invalid euler string');
            }
        }


    }



}