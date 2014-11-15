/// <reference path="../room/roomloader.ts" />
/// <reference path="../room/roomlinker.ts" />

module wm.verse {

    import Room = wm.room.Room;
    import RoomLoader = wm.room.RoomLoader;

    /**
     * Contains room state and methods for switching to and loading other rooms.
     */
    export class RoomCoordinator {

        loader: RoomLoader;
        currentRoom: Room = Room.EmptyRoom;
        rooms: Room[]; //Rooms in memory
        roomDictionary: { [id: string]: Room }; //mapping of room id to room

        public onRoomSwitch: Events.I3ArgsEvent<Room, Room, THREE.Matrix4> = new Events.TypedEvent();


        constructor() {
            this.rooms = [];
            this.roomDictionary = {};
            this.loader = new wm.room.RoomLoader();
        }

        switchToRoomWithId(id: string) {
            if (!this.roomDictionary[id]) {
                throw 'Room "' + id + '" has not been loaded!';
            }

            this.switchToRoom(this.roomDictionary[id]);
        }

        isLoaded(roomId: string) {
            return this.roomDictionary[roomId] ? true : false;
        }


        switchToRoom(room: Room, positionInNewRoom: THREE.Matrix4 = new THREE.Matrix4()): void {
            var previousRoom = this.currentRoom;
            this.currentRoom = room;
            this.onRoomSwitch.trigger(previousRoom, room, positionInNewRoom);
        }

        loadRoom(url: string) {

            var room = this.loader.loadRoom(url);
            if (room.id) { //Room didn't supply an id by itself (debug rooms do that).
                var id = room.id;
            }
            else {
                var id = wm.urlToId(url);
            }

            if (this.isLoaded(id)) {
                throw 'Room "' + id + '" has already been loaded!';
            }

            var room = this.loader.loadRoom(url);
            this.rooms.push(room);
            this.roomDictionary[id] = room;

            wm.room.RoomLinker.introduceRoom(room, this.rooms, this.roomDictionary);
        }









    }


}