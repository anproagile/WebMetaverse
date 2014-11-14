/// <reference path="roomgenerator.ts"/>
module WM.Room {
    export class RoomLoader {

        loadRoom(url: string): Room {
            if (this.stringStartsWith(url, 'debug')) {
                var gen = new DebugRoomGenerator();
                return gen.generateRoomFromURL(url);
            }

            return null;
        }


        stringStartsWith(text: string, target: string): boolean {
            return text.lastIndexOf(target, 0) === 0;
        }
    }

   




}