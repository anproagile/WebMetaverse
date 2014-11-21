module wm.room {

    import Portal = wm.verse.Portal;

    export interface RoomGenerator {

        generateRoomFromURL(url: string): Room;
    }

    export class DebugRoomGenerator implements RoomGenerator {


        generateRoomFromURL(url: String): Room {
            if (url == 'debug1') {
                return this.createDebugRoom1();
            }
            else {
                return this.createDebugRoom2();
            }
        }

        private createDebugRoom1(): Room {
            var room = new Room('debug1');

            var grid = new THREE.GridHelper(100, 10);
            room.add(grid);

            var g = new THREE.BoxGeometry(60, 20, 10);
            var m = new THREE.MeshNormalMaterial();
            var cube = new THREE.Mesh(g, m);
            cube.position.set(0, 10, -95);
            room.add(cube);

            var g2 = new THREE.IcosahedronGeometry(50, 2);
            var m2 = new THREE.MeshNormalMaterial();
            var obj2 = new THREE.Mesh(g2, m2);
            obj2.position.set(0, 10, 95);
            room.add(obj2);

            var portal = new Portal('debug2');
            portal.position.x = -40;
            portal.position.z = -80;
            portal.updateMatrix();
            
            room.portals.push(portal);

            return room;
        }

        private createDebugRoom2(): Room {
            var room = new Room('debug2');
            var g = new THREE.BoxGeometry(60, 20, 10);
            var m = new THREE.MeshPhongMaterial();
            var cube = new THREE.Mesh(g, m);
            cube.position.set(0, 10, -95);
            room.add(cube);

            var sphereGeom = new THREE.SphereGeometry(10);
            var sphereMat = new THREE.MeshBasicMaterial({ color: 0x20F020 });
            var sphere = new THREE.Mesh(sphereGeom, sphereMat);
            sphere.position.x = 50;
            sphere.updateMatrix();
            sphereMat.side = THREE.BackSide;
            room.add(sphere);

            var sphereMat2 = new THREE.MeshBasicMaterial({ color: 0xF0F020 });
            var sphere2 = new THREE.Mesh(sphereGeom, sphereMat2);
            sphere2.position.x = -50;
            sphere2.updateMatrix();
            room.add(sphere2);

            var light = new THREE.DirectionalLight(0xffffff, 2);
            var light2 = new THREE.AmbientLight(0x303030);
            light.position.set(1, 1, 1).normalize();
            room.add(light);
            room.add(light2);
            var grid = new THREE.GridHelper(100, 10);
            grid.setColors(0xff0000, 0x00aacc);
            room.add(grid);

            var portal = new Portal('debug1');
            portal.rotateY(Math.PI);
            portal.position.x = 80;
            
            room.portals.push(portal);
            portal.updateMatrix();

            return room;


        }


    }
} 