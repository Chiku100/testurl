import dotenv from "dotenv";
dotenv.config()
import express from "express";
import bodyParser from "body-parser";
import path from 'path';
import axios from "axios";
import ServerlessHttp from "serverless-http";
import { fileURLToPath } from 'url';
const app = express();
import messages from "./schema.js"
import { user } from "./schema.js";
import mongoose from "mongoose";
import { Router } from "express";
const port = 3000;
// const uri = process.env.URI;
const __filename = fileURLToPath(import.meta.url);
app.use(express.static("public"))
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')))
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'dist'));
let logged_in = false;
let amigo = "";
console.log(process.env.SECRET);
async function main() {
    // await mongoose.connect('mongodb://localhost:27017/test')
    await mongoose.connect(process.env.URI).catch((e) => {
        console.log(e);
        process.exit(0);
    });
}
main().catch((err) => console.log(err))
app.get("/", async (req, res) => {
    
    try {
        const collections = await messages.find()
        res.render(__dirname + "/views/index.ejs", { collections, logged_in, amigo })
    } catch (error) {
        console.log(error);
    }
});


app.post("/", async (req, res) => {
    const link = req.body.inputs

    try {
        const response = await axios.get(`https://api.shrtco.de/v2/shorten?url=${link}`);
        const result = response.data;

        const run = async () => {
            try {

                const userData = new messages({
                    long_url: link,
                    short_url: result.result.short_link

                })
                await userData.save()
            } catch (error) {
                console.log(error);
            }
        }
        await run()
        res.redirect("/")
    } catch (e) {
        res.render("index.ejs", {
            error: e.data
        });
    }

});
app.post('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await messages.findByIdAndDelete(id)
        console.log(`Document with ${data} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
    res.redirect("/")
})
app.get("/signup", (req, res) => {
    res.render("signup.ejs")
})
app.post("/signup", async (req, res) => {
    const email = req.body.email
    const username = req.body.user
    const pass_word = req.body.password
    // console.log(username);
    const createUser = async () => {
        try {
            const User = new user({
                email, password: pass_word, username
            })
            await User.save()
            logged_in = true;
            amigo = checkuser.username
            res.render("success.ejs")
        } catch (error) {
            console.log(error);
        }
    }
    createUser()


})
app.get("/login", (req, res) => {
    res.render("login.ejs")
})
app.post("/login", async (req, res) => {

    const email = req.body.email
    const pass_word = req.body.password
    const checkuser = await user.findOne({ email: email })
    if (checkuser) {
        if (checkuser.password == pass_word) {
            logged_in = true;
            amigo = checkuser.username
            console.log(amigo);
            res.render("loginauth.ejs")
        }
        else {
            const showErr="wrong password"
            res.render("login.ejs",{showErr})
        }
    }
    else {
        res.render(__dirname + "/views/Erroruser.ejs")

    }
})
app.get("/loggedout",(req,res)=>{
    logged_in= !logged_in
    res.render("loggedout.ejs")
})
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
app.use("/.netlify/functions/api", Router)
module.exports.handler=ServerlessHttp(app)