module events {

    export interface IEvent {
        add(listener: () => void): void;
        remove(listener: () => void): void;
        trigger(...a: any[]): void;
    }

    export class TypedEvent implements IEvent {
        // Private member vars
        private _listeners: any[] = [];

        public add(listener: () => void): void {
            /// <summary>Registers a new listener for the event.</summary>
            /// <param name="listener">The callback function to register.</param>
            this._listeners.push(listener);
        }
        public remove(listener?: () => void): void {
            /// <summary>Unregisters a listener from the event.</summary>
            /// <param name="listener">The callback function that was registered. If missing then all listeners will be removed.</param>
            if (typeof listener === 'function') {
                for (var i = 0, l = this._listeners.length; i < l; i++) {
                    if (this._listeners[i] === listener) {
                        this._listeners.splice(i, 1);
                        break;
                    }
                }
            } else {
                this._listeners = [];
            }
        }

        public trigger(...a: any[]): void {
            /// <summary>Invokes all of the listeners for this event.</summary>
            /// <param name="args">Optional set of arguments to pass to listners.</param>
            var context = {};
            var listeners = this._listeners.slice(0);
            for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i].apply(context, a || []);
            }
        }
    }

    export interface I1ArgsEvent<T> extends IEvent {
        add(listener: (message: T) => any): void;
        remove(listener: (message: T) => any): void;
        trigger(message: T): void;
    }

    export interface I2ArgsEvent<T, U> extends IEvent {
        add(listener: (message1: T, message2: U) => any): void;
        remove(listener: (message: T, message2: U) => any): void;
        trigger(message: T, message2: U): void;
    }

    export interface I3ArgsEvent<T, U, V> extends IEvent {
        add(listener: (message1: T, message2: U, message3: V) => any): void;
        remove(listener: (message: T, message2: U, message3: V) => any): void;
        trigger(message: T, message2: U, message3: V): void;
    }

}