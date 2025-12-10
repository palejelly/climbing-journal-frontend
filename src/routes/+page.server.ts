import type { ISession, IUser } from "$lib/interfaces";
import {fail, type Action, type Actions} from "@sveltejs/kit";
// import PostgreSQL from "$lib/db_postgresql";
import fetchData from "$lib/db_blobstorage";

const test = process.env.SECRET_TEST_JL;


// For local dev
// const API_BASE_URL = 'http://127.0.0.1:3000';

const test_env_var : Action = async ({request}) =>{
    try{
        return { 
            success: true,
            message: "this is the secret: "+ test
        };
    }
    catch{
        return fail(400,{message: 'fail to get the env variables'});
    }
}

const login: Action = async ({request}) => {
    // get the form data
    console.log(request);
    const data = await request.formData();

    const username = data.get('username');
    const password = data.get('password');


    // Make sure we have the proper fields sent in
    if(
        typeof username !== 'string' ||
        typeof password !== 'string' ||
        !username ||
        !password
    ){
        return fail(400, {message: 'Please proovide your username and password'});
    }

    // check password in database
    const loginData = { username, password };

    // will bring this back.
    // try {
    //   const result = await fetchData('/auth/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(loginData)
    //   });

    //   if(result.rowCount == 0){
    //     return fail(400, {message: result.message});
    //   }

    //   // CONVERT DB ROW TO JS OBJECT
    //   const user: IUser = {...result.rows[0]}

    //   // create session and get session GUID
    //   const sessionSQL = ``
    //   const sessionResp = await PostgreSQL().query(sessionSQL, [user.user_id]);

    //   const session : ISession = {...sessionResp.rows[0]};

    //   // SET COOKIE IN BROWSER WITH SESSION GUID
    //   // 7:33 on the video. 
    //   // TODO: need to import POSTGRESQL from the video
    //   // setup POSTGRESQL SERVER ON AZURE and stop using fetch DATA
    //   // so there will be 
    //   // 1. front end server (routing and getting request from the client) [AZURE ]
    //   // 2. log in server that gets request from from the front end server. [AZURE PostgreSQL]
    //   // 3. media server that saves video which also gets request from the front end server. [AZURE BLOB STORAGE]

    
    // //   loginMessage = result.message;
    // } catch (e) {
    // //   errorMessage = e.message;
    // }


}   

export const actions: Actions = {login, test_env_var}

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



