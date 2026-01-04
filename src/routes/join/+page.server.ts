import { fail, redirect, type Actions } from '@sveltejs/kit';
import PostgreSQL from '$lib/db_postgresql';

export const actions: Actions = {
    join: async ({ request }) => {
        const formData = await request.formData();
        
        // 1. Extract form data
        const username = (formData.get('username') as string || '').trim();
        const email = (formData.get('email') as string || '').trim().toLowerCase();
        const password = formData.get('password') as string || '';
        const passwordCheck = formData.get('password_check') as string || '';
        const inviteCode = (formData.get('invite_code') as string || '').trim();

        // 2. Basic Validations
        if (!username || !email || !password) {
            return fail(400, { message: "Required fields are missing." });
        }

        if (password !== passwordCheck) {
            return fail(400, { message: "Passwords do not match." });
        }

        // Invitation Code Check
        if (inviteCode !== "harmonic") {
            return fail(400, { message: "Invalid Invitation Code." });
        }

        const db = PostgreSQL();

        try {
            // 3. Check if user already exists in the 'data' schema
            const existingUser = await db.query(
                "SELECT user_id FROM data.users WHERE email = $1 OR user_name = $2",
                [email.toLowerCase(), username]
            );

            if (existingUser.rows.length > 0) {
                return fail(409, { message: "Username or Email already exists." });
            }

            // 4. Insert into 'data.users' using pgcrypto functions
            // We use crypt($3, gen_salt('bf', 8)) to hash the password inside the DB
            await db.query(
                `INSERT INTO data.users (user_name, email, hash_password) 
                 VALUES ($1, $2, crypt($3, gen_salt('bf', 8)))`,
                [username, email.toLowerCase(), password]
            );

        } catch (err) {
            console.error('Registration error:', err);
            return fail(500, { message: "Database connection error." });
        }

        // 5. Success redirect
        throw redirect(303, '/login?msg=account_created');
    
    }
};