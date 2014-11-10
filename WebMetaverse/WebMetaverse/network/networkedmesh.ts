module WM.Network {
    export class NetworkedMesh {

        mesh: THREE.Mesh;
        buffer: StateBuffer;

        static interpolation: number = 200; //How long in the past other people are shown.
        //Should really, at minimum be position-send-interval + ping to user.
        //Higher is safer, although people are looking further into the past.
        //Too high with a buffer that is too small means there may be no packet to that is older than
        //the time it is trying to predict. Which you really don't want.


        constructor(mesh: THREE.Mesh) {
            this.mesh = mesh;
            this.buffer = new StateBuffer(32);
        }


        update() {
            var interpTime = Date.now() - NetworkedMesh.interpolation;

            var newest = this.buffer.getNewest();
            if (!newest) {//no package received yet
                return;
            }

            if (interpTime < newest.time) { //We can probably interpolate!
                //This interpolation should extrapolate backwards, but it doesn't.
                //I think that for this one second right after we can use a newer position instead of predicting
                //where the networked mesh WAS (and not where it is going to be like in the else case).
                var stateAfterIndex = this.buffer.getShortestAfterTimestampIndex(interpTime);
                var stateBefore = this.buffer.getBeforeIndex(stateAfterIndex);

                var stateAfter = this.buffer.get(stateAfterIndex);
                if (!stateBefore) {
                    stateBefore = stateAfter;
                }

                var timeDiff = stateAfter.time - stateBefore.time;
                var alpha = 0;
                if (timeDiff > 0.0005) { // I don't want to divide by zero.
                    alpha = (interpTime - stateBefore.time) / timeDiff;
                }

                //console.log("Interpolating between " + stateBefore.time + " | " + stateAfter.time);
                //console.log("i");

                this.mesh.position.copy(stateBefore.pos).lerp(stateAfter.pos, alpha);

                //Voodoo from http://stackoverflow.com/questions/2708476/rotation-interpolation
                var yRot = (((((stateAfter.ry - stateBefore.ry) % (Math.PI * 2)) + (Math.PI * 1.5)) % (Math.PI * 2)) - (Math.PI)) * alpha;
                this.mesh.rotation.set(0, yRot, 0);
                this.mesh.updateMatrix();
            }
            else { //extrapolate!
                //console.log("e");
                var extrapolationTime = interpTime - newest.time;

                if (extrapolationTime < 420) { //Better not extrapolate too far into the future, prevents endlessly floating objects.
                    this.mesh.position.copy(newest.pos).add(newest.vel.clone().multiplyScalar(extrapolationTime)); //pos = newestPos + newestVel * timeElapsed
                    this.mesh.rotation.set(0, newest.ry, 0);
                }
                else { //Put player at last known position
                    this.mesh.position.set(newest.pos.x, newest.pos.y, newest.pos.z);
                    this.mesh.rotation.set(0, newest.ry, 0);
                }
            }

        }

        receivePosition(data: PositionPacket) {

            if (this.buffer.getNewest() && this.buffer.getNewest().time > data.ts) {
                console.log("Already have a newer state, inserting is not worth the effort, discarding");
                //It does however still hold value, as it allows for more precise interpolation.
                return;
            }


            var state = {
                time: data.ts,
                pos: new THREE.Vector3(data.x, data.y, data.z),
                ry: data.ry,
                vel: new THREE.Vector3() //To be set if velocity is known
            }

            var before = this.buffer.getBeforeState(state);
            if (before) {
                var timeDifference = state.time - before.time;
                var positionDifference = new THREE.Vector3().subVectors(state.pos, before.pos);
                state.vel = positionDifference.divideScalar(timeDifference);
            } 

            this.buffer.push(state);
        }





    }

    export interface PositionPacket {
        t: any; //type of packet, in this case should always be "p"
        ts: number; //timestamp
        x: number;
        y: number;
        z: number;
        ry: number; //y rotation
    }


    export interface State {
        time: number; //timestamp
        pos: THREE.Vector3;
        vel: THREE.Vector3;
        ry: number; //y rotation
    }

    export class StateBuffer { //Circular buffer, which happens to be ordered
        buffer: State[];
        pointer: number; //Points to the newest entry

        //         [ 5, 6, 7, 1, 2, 3] (timestamps)
        //                 |     
        //               pointer = 2      

        constructor(length: number) {
            this.buffer = [];
            this.buffer.length = length;
            this.pointer = 0;
        }

        push(state: State) {
            if (this.buffer[this.pointer] && this.getNewest().time > state.time) {
                console.log("Already have a newer state, inserting is not worth the effort, discarding");
            }

            this.buffer[(this.pointer + 1) % this.buffer.length] = state;
            this.pointer = (this.pointer + 1) % this.buffer.length;
        }

        get(index): State {
            return this.buffer[index];
        }

        getNewest(): State {
            return this.buffer[this.pointer];
        }

        /**
        * Returns the state before given index, so if index is 1, it returns state at index 0.
        */
        getBeforeIndex(index: number): State {
            return this.buffer[(this.buffer.length + index - 1) % this.buffer.length];
        }

        /**
        * Returns the state before timestamp, null if not present.
        * Optional: index parameter, start searching from this index.
        */
        getBeforeTimestamp(timestamp: number, index=this.pointer): State {

            do {
                if (this.buffer[index] && this.buffer[index].time < timestamp) {
                    return this.buffer[index];
                }
                index = (this.buffer.length + index - 1) % this.buffer.length;
            }
            while (index != this.pointer);

            return null;
        }

        /**
        * Returns the index of state that is shortest after timestamp, latest if not present.
        * Note that latest may not actually be after given timestamp!
        * Throws error when called with timestamp greater than latest timestamp in  buffer.
        */
        getShortestAfterTimestampIndex(timestamp: number): number {
            var index = this.pointer;

            var prev = index;

            do {
                if (!this.getBeforeIndex(index) || this.getBeforeIndex(index).time < timestamp) {
                    return index;
                }
                prev = index;
                index = (this.buffer.length + index - 1) % this.buffer.length;
            }
            while (index != this.pointer);

            console.log("Way out of sync");
            return prev;

           // throw "This shouldn't have happened!"; 
           // return -1;
        }



        getBeforeState(state: State): State {
            return this.getBeforeTimestamp(state.time);
        }
    }


}