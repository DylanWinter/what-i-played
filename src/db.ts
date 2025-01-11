import pg from "pg";
import {release} from "node:os";

const { Client } = pg;

class Database {
    db: any;

    constructor() {
        this.db =  new Client({
            user: 'postgres',
            password: 'Dbpk3466',
            host     : 'localhost',
            port     :  5432,
            database : "whatiplayed"
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

    async addGameEntry(userId: number, title:string, releaseYear:number, remasterYear:number,
                       rating:number, thoughts:string, platform:string, modded:boolean, replay: boolean, dropped:boolean)
    {
        const query = `INSERT INTO entries(user_id, game_name, rating, thoughts, release_year, remaster_year, platform, modded, replaying, dropped)
                       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

        let releaseYearClean:number|null = Number.isNaN(releaseYear) ? null : releaseYear;
        let remasterYearClean:number|null = Number.isNaN(remasterYear) ? null : remasterYear;
        let ratingClean:number|null = Number.isNaN(rating) ? null : rating;

        try {
             await this.db.query(query, [userId, title, ratingClean, thoughts, releaseYearClean, remasterYearClean, platform, modded, replay, dropped]);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }

    async deleteGameEntry(user_id: number, title: string):Promise<any> {
        let query:string = `DELETE FROM entries WHERE user_id = $1 AND game_name = $2`;
        try {
            await this.db.query(query, [user_id, title]);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
}

export const db = new Database();
