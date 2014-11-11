module WM.Network {

    export interface State {
        time: number; //timestamp
        pos: THREE.Vector3;
        vel: THREE.Vector3;
        rot: THREE.Quaternion;
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
                mlog.log("Already have a newer state, inserting is not worth the effort, discarding");
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