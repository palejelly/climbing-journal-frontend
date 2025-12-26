import type { ISession, IUser } from "$lib/interfaces";
import {fail, type Action, type Actions} from "@sveltejs/kit";
import fetchData from "$lib/db_blobstorage";
import PostgreSQL from "$lib/db_postgresql";

const login: Action = async ({request, cookies}) => {
    // get the form data
    console.log(request);
    const data = await request.formData();

    const email = data.get('email');
    const password = data.get('password');


    // Make sure we have the proper fields sent in
    if(
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !email ||
        !password
    ){
        return fail(400, {message: 'Please proovide your email and password'});
    }

    const sql = ` select * from data.users where lower(email) = lower($1) and hash_password = crypt($2, hash_password) `
    const resp = await PostgreSQL().query(sql, [email, password])
    // check password in database
    const loginData = { email, password };

    if(resp.rowCount==0){
        return fail(400,{message:"Your email or password is incorrect"});
    }

    // CONVERT DB ROW TO JS OBJECT
    const user: IUser = {...resp.rows[0]}

    // create session and get session GUID
    const sessionSQL = `insert into data.session(user_id, date_expired) values ($1, now() + ('8 hour')::interval) returning guid_id `
    const sessionResp = await PostgreSQL().query(sessionSQL, [user.user_id]);

    const session : ISession = {...sessionResp.rows[0]};

    // SET COOKIE IN BROWSER WITH SESSION GUID
    //   // 7:33 on the video. 
    //   // so there will be 
    //   // 1. front end server (routing and getting request from the client) [AZURE ]
    //   // 2. log in server that gets request from from the front end server. [AZURE PostgreSQL]
    //   // 3. media server that saves video which also gets request from the front end server. [AZURE BLOB STORAGE]

    cookies.set('svelte_app_session', session.guid_id,{
        path:'/', //every page
        maxAge: 60*60*8 // 8 hours.
    });
    
    return {
        success: true
    }


}   


export const actions: Actions = {login}
