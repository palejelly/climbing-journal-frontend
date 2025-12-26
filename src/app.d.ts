import type { IUser } from "$lib/interfaces";

declare global{
    namespace App{
        interface Locals{
            user:IUser;
        }
    }
}

export {};