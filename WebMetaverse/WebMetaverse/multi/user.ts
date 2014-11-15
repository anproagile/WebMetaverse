module wm.multi {
    export class User {
        id: string;

        constructor(id: string) {
            this.id = id;
        }


    }

    export class LocalUser extends User {

    }

}