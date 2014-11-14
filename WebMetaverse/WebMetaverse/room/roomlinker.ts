module WM.Room {

    import Portal = WM.Verse.Portal;

    /**
    * Links the portals in rooms together upon loading a room.
    */
    export class RoomLinker {

        static introduceRoom(newRoom: Room, rooms: Room[], roomDictionary: { [id: string]: Room }) {

            //Link new room's portals
            newRoom.portals.forEach( (portal) => {
                if (roomDictionary[portal.toRoomId]) {
                    this.linkPortalToRoom(portal, roomDictionary[portal.toRoomId]);
                }
            });

            //Link existing rooms
            rooms.forEach((room) =>
                room.portals.forEach((portal) => {
                    if (portal.toRoomId == newRoom.id && !portal.isLinked()) {
                        this.linkPortalToRoom(portal, roomDictionary[portal.toRoomId]);
                    }
                })
            );
        }

        static linkPortalToRoom(portal: Portal, room: Room) {
            if (!room.entrancePortal) {
                room.addEntrancePortal(); //Lazily add entrance portal
            }

            portal.setToPortal(room.entrancePortal, room);
        }


        

    }



}