import { Strategy as LocalStrategy } from 'passport-local';
import dotenv from 'dotenv';
import bcrypt from "bcrypt"
import { db } from "./db.ts"

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

function initialize(passport:any) {
    const authenticateUser = async (email:string, password:string, done:any) => {
        try {
            const user_db = await db.getUserByEmail(email);
            if (!user_db) {
                return done(null, false, { message: 'Invalid email' });
            }

            if (await bcrypt.compare(password, user_db.password_hash)) {
                return done(null, user_db);
            }
            else {
                return done(null, false, { message: 'Incorrect password' });
            }
        } catch (e) {
            return done(null, false, {message: 'Error while authenticating user'});
        }
    }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser));
    passport.serializeUser((user:any, done:any) => {
        done(null, user.id);
    });
    passport.deserializeUser((id:any, done:any) => {
        const user = db.getUserById(id);
        done(null, user);
    });
}

module.exports = initialize;