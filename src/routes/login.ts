import * as express from "express";
import Parse from "parse/node";
import * as dotenv from "dotenv";
import { PARSE_APP_ID, PARSE_JAVASCRIPT_KEY, MASTER_KEY } from "./app_constants";

// load environment variables from .env file
dotenv.config();


const router = express.Router();

export function initializeParse(): void {
    console.log("Parse Initalized");
    Parse.initialize(PARSE_APP_ID, PARSE_JAVASCRIPT_KEY, MASTER_KEY);
    Parse.serverURL = "https://parseapi.back4app.com";
}

// need to export function for Jest testing.
export async function registerUser(req, res): Promise<void> {
    try {
        // Create a Parse class called User
        const user = new Parse.User(req.body);
        await user.signUp();
        res.status(201);
        res.send({user: user});
    } catch (error) {
        res.status(400);
        res.send({error: "Failed to create user: " + error});
    }
}

router.post("/register", registerUser);

//export function for Jest testing.
export async function loginUser(req, res): Promise<void> {
    try {
        const user = await Parse.User.logIn(req.body.username, req.body.password);
        const sessionToken = await user.getSessionToken();
        res.status(200)
        res.send({user: user, sessionToken: sessionToken});
    } catch (error) {
        res.status(400);
        res.send({error: "Login failed: " + error});
    }
}

router.post("/login", loginUser);

//export function for Jest testing.
export async function logoutUser(req, res): Promise<void> {
    try {
        const sessionToken = req.body.sessionToken;
        const query = new Parse.Query(Parse.Session);
        query.equalTo('sessionToken', sessionToken);
        const session = await query.first({useMasterKey: true});
        if (session) {
            await session.destroy({useMasterKey: true});
            res.status(200);
            res.send({success: "Logged out successfully"});
        } else {
            res.status(400);
            res.send({error: "Invalid session token"});
        }
    } catch (error) {
        res.status(400);
        res.send({error: "Failed to log out: " + error});
    }
}

router.post("/logout", logoutUser)


export async function editEmail(req, res): Promise<void>{
    try {
        const User = Parse.Object.extend("User");
        const user = await Parse.User.logIn(req.body.username, req.body.password);
        const currentUser = user;
        currentUser.set("email", req.body.newEmail);
        await currentUser.save(null, { useMasterKey: true });
        res.status(200).send({ message: "User email successfully updated" });
    } catch (error) {
        res.status(400);
        res.send({ error: "Failed to edit username: " + error });
    }
}

router.put("/editemail", editEmail);


export async function editUsername(req, res): Promise<void>{
    try {
        const User = Parse.Object.extend("User");
        const user = await Parse.User.logIn(req.body.username, req.body.password);
        const currentUser = user;// Parse.User.current();
        currentUser.set("username", req.body.newUsername);
        await currentUser.save(null, { useMasterKey: true });
        res.status(200).send({ message: "User email successfully updated" });
    } catch (error) {
        res.status(400);
        res.send({ error: "Failed to edit username: " + error });
    }
}

router.put("/editusername", editUsername);
//export function for Jest testing.
export function currUser(req, res) {
    try {
        const currentUser = Parse.User.current();
        if (currentUser == null) {
            res.status(400);
            res.send({error: "No current user"});
        }
        res.send({currUser: currentUser});
    } catch (error) {
        res.status(400);
        res.send({error: "Failed to get current user " + error});
    }
}

router.get("/currUser", currUser);

// export the router as default
// import from the server, e.g., import login from ...
export default router;
