/// <reference path="../ds/circularbuffer.ts"/>
module WM.Network {

    export interface State {
        time: number; //timestamp
        pos: THREE.Vector3;
        vel: THREE.Vector3;
        rot: THREE.Quaternion;
    }

    export class StateBuffer extends DS.CircularBuffer<State>{

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
        getBeforeTimestamp(timestamp: number, index= this.pointer): State {

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
        */
        getShortestAfterTimestampIndex(timestamp: number, fixTimeStepCallback: () => void): number {
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
            mlog.info("Way out of sync, probably unsynced clocks, your clock is likely ahead, will attempt fix.");
            fixTimeStepCallback();
            return prev;
        }

        getBeforeState(state: State): State {
            return this.getBeforeTimestamp(state.time);
        }
    }
}