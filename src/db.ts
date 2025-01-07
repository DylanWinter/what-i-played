import pg from "pg";

const { Client } = pg;

class Database {
    db: any;

    constructor() {
        this.db =  new Client({
            user: 'postgres',
            password: '5614',
            host     : 'localhost',
            port     :  5432,
            database : "WhatIPlayed"
        })
        this.db.connect()
    }

   async getUserByEmail(email: string):Promise<any> {
        try {
            const query = `SELECT * FROM users WHERE email = $1`
            const result:any = await this.db.query(query, [email]);
            if (result.rows.length > 0) {
                return result.rows[0];
            } else {
                return null;
            }
        }
        catch (e) {
            console.log("Error fetching user by email");
        }
    }

   async getUserById(id: number) {
        let result:any = await this.db.query(`SELECT * FROM users WHERE id = ${id}`);
        return result.rows[0];
    }

    async addUser( username:string, email: string, passwordHash: string):Promise<void> {
        try {
            const query = "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)";
            await this.db.query(query, [username, email, passwordHash]);
        } catch (e) {
            // @ts-ignore
            if (e.code === '23505') {
                console.log("Error adding user");
                throw new Error("Duplicate entry: email or username must be unique.");
            } else {
                console.error(e);
            }
        }
    }

    async getUserGameDataById(id: number):Promise<any> {
        const query = `SELECT game_name, rating, thoughts, release_year, remaster_year, platform, modded, replaying, dropped
                       FROM entries
                       WHERE user_id = ($1);`;
        let result:any = await this.db.query(query, [id]);
        return result.rows;
    }
}

export const db = new Database();
