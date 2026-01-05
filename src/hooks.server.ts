
// this file runs on EVERY request 
// we'll use it to check if user is logged in
import PostgreSQL from "$lib/db_postgresql";
import type { IUser } from "$lib/interfaces";
import { redirect } from "@sveltejs/kit";

export async function handle({event, resolve}){
    // do something to the request before sending back the response
    
    // check the session cookie
    const sessionGUID = event.cookies.get('svelte_app_session');
    if(sessionGUID){
        // get user from DB using session
        const sql = `select session.user_id, users.user_name, users.email, session.date_expired
        from data.session
        inner join data.users on users.user_id = session.user_id
        where session.guid_id = $1
        `;
        const resp = await PostgreSQL().query(sql, [sessionGUID]);
        if(resp.rowCount && resp.rows[0].date_expired > Date.now()){
            const user:IUser = {...resp.rows[0]};
            // set the locals!

            // event local is a place where we save things that we might read on each page
            event.locals.user = user;
        }
    }

    // send user back to login page if not logged in. 
    // not sure we need this feature now. 
    if(event.url.pathname !== '/login' && event.url.pathname !== '/join' && !event.locals.user ){
        throw redirect(303, '/login');
    }

    return await resolve(event)
}