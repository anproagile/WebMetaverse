// Type definitions for minilog v2
// Project: https://github.com/mixu/minilog
// Definitions by: Guido <http://guido.io>>
// Definitions: -

//These type definitions are not complete.
interface Minilog {
    debug(any);
    info(any);
    log(any);
    warn(any);
    error(any);
}

declare function Minilog(namespace: string): Minilog;

declare module Minilog {
    export function enable();
    export function disable();
    export function pipe(dest: any);

    export var suggest: Filter;
    export var backends: Minilog.MinilogBackends;


    export interface Filter {

        /**
        * Adds an entry to the whitelist
        */
        allow(name, level);
        /**
        * Adds an entry to the blacklist
        */
        deny(name, level);
        /**
        * Empties the whitelist and blacklist
        */
        clear();

        test(name, level);
        write(name, level, args);

        /**
        * specifies the behavior when a log line doesn't match either the whitelist or the blacklist. 
        The default is true (= "allow by default") - lines that do not match the whitelist or the blacklist are not filtered (e.g. ). 
        If you want to flip the default so that lines are filtered unless they are on the whitelist, set this to false (= "deny by default").
        */
        defaultResult: boolean;

        /**
        * controls whether the filter is enabled. Default: true
        */
        enabled: boolean;

    }
    

    export interface MinilogBackends {
        array: any;
        browser: any;
        localstorage: any;
        jQuery: any;
    }
}