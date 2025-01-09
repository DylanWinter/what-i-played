import express, { Request, Response } from "express";
import path from "path";
import bcrypt from "bcrypt";
import passport from "passport";
import session from "express-session";

import { db } from "./db.ts";
import initializePassport from "./passport-config.ts";


initializePassport(passport);

const app = express();
const PORT = process.env.PORT || 3001;


// Middleware
const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1'); // modify path for Windows
const publicDir = path.join(__dirname, "..", "public");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'default',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
    },
}));
app.use(passport.initialize());
app.use(passport.session());


function ensureAuthenticated(req: Request, res: Response, next: Function) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send("Unauthorized: User not authenticated");
}

// Routes
app.get("/", (_req: Request, res: Response) => {
    res.sendFile(path.resolve(publicDir, "build", "index.html"));
})

app.get("/login", (_req: Request, res: Response) => {
    res.sendFile(path.resolve(publicDir, "login.html"));
});

app.get("/register", (_req: Request, res: Response) => {
   res.sendFile(path.resolve(publicDir, "register.html"));
});

app.post("/login", passport.authenticate("local", {
    secret: process.env.SESSION_SECRET,
    successRedirect: "/",
    failureRedirect: "/login",
}));

app.post("/register", async (req: Request, res: Response) => {
   try {
       const hash = await bcrypt.hash(req.body.password, 10);
       console.log(req.body.username, req.body.email, hash);
       await db.addUser(req.body.username, req.body.email, hash);
       res.redirect("/login");
   } catch (e) {
        console.log("Error:", e);
        res.redirect("/register");
   }
});

app.post("/api/getList", ensureAuthenticated, async (req: Request, res: Response) => {
    let user:User = await req.user;
    let results = await db.getUserGameDataById(user.id);
    res.send(results);
})

app.post("/api/addGame", ensureAuthenticated, async (req: Request, res: Response) => {
    let user:User = await req.user;
    let data:any = req.body;
    try {
        db.addGameEntry(user.id, data.title, parseInt(data.releaseYear), parseInt(data.remasterYear), parseInt(data.rating),
            data.thoughts, data.platform, data.modded, data.replay, data.dropped);
        res.status(201).send("Game Added");
    }
    catch (e) {
        res.status(400).send("Error adding game entry");
    }
})

// Static middleware, needs to be defined after routes
app.use(express.static(path.resolve(publicDir)));
app.use(express.static(path.resolve(publicDir, "build")));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});