import type { ISession, IUser } from "$lib/interfaces";
import {fail, type Action, type Actions} from "@sveltejs/kit";
import fetchData from "$lib/db_blobstorage";
import PostgreSQL from "$lib/db_postgresql";

const test = process.env.SECRET_TEST_JL;


// For local dev
// const API_BASE_URL = 'http://127.0.0.1:3000';

const test_env_var : Action = async ({request}) =>{
    try{

        const sql = ` SELECT user_id, email, hash_password FROM data.users LIMIT 1000; `
        const resp = await PostgreSQL().query(sql)

        return { 
            success: true,
            message: resp.rows
        };
    }
    catch{
        return fail(400,{message: 'fail to get the env variables'});
    }
}

export const load = async ({locals} ) => {
    if(locals.user){
        return {
            user: locals.user
        }
    }
}

export const actions: Actions = { test_env_var}

//   async function handleLogin(event) {
//     event.preventDefault();
//     // clearError();
//     const form = event.target;
//     const username = form.username.value;
//     const password = form.password.value;
//     const loginData = { username, password };

//     try {
//       const result = await fetchData('/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(loginData)
//       });
//       loginMessage = result.message;
//     } catch (e) {
//       errorMessage = e.message;
//     }
//   }



