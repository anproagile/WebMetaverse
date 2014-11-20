module wm.room {

    import Portal = wm.verse.Portal;

    /**
    * Links the portals in rooms together upon loading a room.
    */
    export class RoomLinker {

        static introduceRoom(newRoom: Room, rooms: Room[], roomDictionary: { [id: string]: Room }) {

            //Link new room's portals
            newRoom.portals.forEach( (portal) => {
                if (roomDictionary[portal.toRoomId]) {
                    this.linkPortalToRoom(newRoom, portal, roomDictionary[portal.toRoomId]);
                }
            });

            //Link existing rooms
            rooms.forEach((room) =>
                room.portals.forEach((portal) => {
                    if (portal.toRoomId == newRoom.id && !portal.isLinked()) {
                        this.linkPortalToRoom(room, portal, roomDictionary[portal.toRoomId]);
                    }
                })
            );
        }

        static linkPortalToRoom(fromRoom: Room, portal: Portal, room: Room) {
            if (!room.entrancePortal) {
                room.addEntrancePortal(); //Lazily add entrance portal
            }
            
            portal.setToPortal(room.entrancePortal, room);
            //room.entrancePortal.setToPortal(portal, fromRoom);
        }


        

    }



}