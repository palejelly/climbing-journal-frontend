import type { PoolClient } from "pg";
import pkg from 'pg';
const {Pool} = pkg;

// Use dynamic private env (Best for SvelteKit + Azure)
import { env } from '$env/dynamic/private';

const PostgreSQL = () => {
    
    const api = {
        checkConnection: async (): Promise<PoolClient> => {
            return await (await DBInstance.getInstance()).getContext()
        },
        query: async (sql: string, params: any[] = []): Promise<any> => {
            const dbContext = await (await DBInstance.getInstance()).getContext();
            if(dbContext){
                try{ 
                    const res = await dbContext.query(sql, params);
                    return res;
                } catch (err) {
                    if (err instanceof Error) {
                        console.error("SQL Error:", err.message);
                    }
                    throw new Error('There was a problem reading the database')
                }
            } else {
                throw new Error('Database not available')
            }
        },
    }; 
    return api;
};

export default PostgreSQL;

export class DBInstance {
    private static dbContext: PoolClient;
    private static instance: DBInstance | undefined; // Allow undefined

    private async initialize() {
        // Safe check for port, default to 5432 if missing
        const port = env.SECRET_PGPORT ? Number(env.SECRET_PGPORT) : 5432;
        
        // Disable SSL if on localhost, otherwise use it (for Azure)
        const useSSL = env.SECRET_PGHOST === 'localhost' || env.SECRET_PGHOST === '127.0.0.1' 
            ? false 
            : { rejectUnauthorized: false };

        console.log(`🔌 Connecting to DB at ${env.SECRET_PGHOST}:${port}...`);

        try {
            const pool = new Pool({
                database: env.SECRET_PGDATABASE,
                host: env.SECRET_PGHOST,
                user: env.SECRET_PGUSER,
                password: env.SECRET_PGPASSWORD,
                port: port,
                idleTimeoutMillis: 15000,
                connectionTimeoutMillis: 5000,
                max: 50,
                ssl: useSSL, 
            })
            DBInstance.dbContext = await pool.connect()
            console.log("✅ Database connected successfully");
        } catch (err) {
            console.error("❌ Database Connection Failed:", err);
            throw err; // Re-throw so getInstance knows it failed
        }
    }

    public static getInstance = async (): Promise<DBInstance> => {
        // FIX: Only assign instance if initialization SUCCEEDS
        if (!DBInstance.instance) {
            const tempInstance = new DBInstance();
            await tempInstance.initialize(); 
            DBInstance.instance = tempInstance;
        }
        return DBInstance.instance;
    };

    public getContext = async (): Promise<PoolClient> => {
        return DBInstance.dbContext;
    }
}