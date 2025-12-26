interface IUser {
    user_name: string,
    user_id: number,
    email: string,
}

interface ISession {
    guid_id: string,
    // status

}

export type {IUser, ISession};