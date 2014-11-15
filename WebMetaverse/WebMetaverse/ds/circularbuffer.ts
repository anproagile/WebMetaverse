/**
* Author Guido Zuidhof / http://guido.io
*/
module DS {
    /**
    * Circular buffer
    * Data structure that uses a single, fixed-size buffer. 
    * A new entry overwrites the oldest entry when the buffer is full.
    */ 
    export class CircularBuffer<T> {

        buffer: T[];
        /**
        * Index of the newest entry
        */
        pointer: number;

        //         [ 5, 6, 7, 1, 2, 3, 4]
        //                 |     
        //               pointer = 2      

        constructor(length: number) {
            this.buffer = [];
            this.buffer.length = length;
            this.pointer = 0;
        }

        push(element: T) {
            this.pointer = (this.pointer + 1) % this.buffer.length;
            this.buffer[this.pointer] = element;
        }

        get(index): T {
            return this.buffer[index];
        }

        getNewest(): T {
            return this.buffer[this.pointer];
        }

        clear(): void {
            this.buffer = [];
        }

    }
}