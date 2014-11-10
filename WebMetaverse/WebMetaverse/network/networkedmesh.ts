module WM.Network {
    export class NetworkedMesh {

        mesh: THREE.Mesh;
        buffer: StateBuffer;

        interpolationBacktime: number = 200; //How long in the past other people are shown.
        //Should really, at minimum be position-send-interval + ping to user.
        //Higher is safer, although people are looking further into the past.
        //Too high with a buffer that is too small means there may be no packet to that is older than
        //the time it is trying to predict. Which you really don't want.

        static expectedPacketInterval = 3 / 60 * 1000; //20 per second, 50ms.

        constructor(mesh: THREE.Mesh) {
            this.mesh = mesh;
            this.buffer = new StateBuffer(16);
        }

        lastPacketReceivedLocalTime: number = 0;



        optimizeInterpolationBacktime = () => {
            var newest = this.buffer.getNewest();

            //If we have received a packet, ever, and this isn't likely package loss causing the big discrepancy
            if (newest && this.lastPacketReceivedLocalTime > Date.now() - NetworkedMesh.expectedPacketInterval * 3) { 
                this.interpolationBacktime = 2 * NetworkedMesh.expectedPacketInterval + newest.time; //With 0 ms ping, approx 100ms backtime.
                //With 100 ms ping, 200 ms backtime. Simple! 
            }
        }


        update() {
            var interpTime = Date.now() - this.interpolationBacktime;

            var newest = this.buffer.getNewest();
            if (!newest) {//no package received yet
                return;
            }

            if (interpTime < newest.time) { //We can probably interpolate!
                //This interpolation should extrapolate backwards, but it doesn't.
                //I think that for this one second right after we can use a newer position instead of predicting
                //where the networked mesh WAS (and not where it is going to be like in the else case).
                var stateAfterIndex = this.buffer.getShortestAfterTimestampIndex(interpTime, this.optimizeInterpolationBacktime);
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

                
                this.mesh.quaternion.copy(stateBefore.rot).slerp(stateAfter.rot, alpha);
                this.mesh.updateMatrix();
            }
            else { //extrapolate!
                //console.log("e");
                var extrapolationTime = interpTime - newest.time;

                if (extrapolationTime < 420) { //Better not extrapolate too far into the future, prevents endlessly floating objects.
                    this.mesh.position.copy(newest.pos).add(newest.vel.clone().multiplyScalar(extrapolationTime)); //pos = newestPos + newestVel * timeElapsed
                    this.mesh.setRotationFromQuaternion(newest.rot);
                }
                else { //Put player at last known position
                    this.mesh.position.set(newest.pos.x, newest.pos.y, newest.pos.z);
                    this.mesh.setRotationFromQuaternion(newest.rot);

                    //Maybe the clocks are way off.
                    this.optimizeInterpolationBacktime();
                }
            }

        }

        receivePosition(data: PositionPacket) {

            if (this.buffer.getNewest() && this.buffer.getNewest().time > data.ts) {
                mlog.log("Already have a newer state, inserting is not worth the effort, discarding");
                //It does however still hold value, as it allows for more precise interpolation.
                return;
            }
            this.lastPacketReceivedLocalTime = Date.now();

            var state = {
                time: data.ts,
                pos: new THREE.Vector3(data.x, data.y, data.z),
                rot: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, data.ry, 0)),
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


}