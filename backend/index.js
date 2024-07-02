import express from "express";
import mysql from "mysql2";
import cors from "cors";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import usersRouter from './routes/users.js';
import blogsRouter from './routes/blogs.js';
import reviewsRouter from './routes/reviews.js';
import profileRouter from './routes/profile.js';
import {verifyUser, getUser} from "./middlewares.js";

const app = express();

const saltRounds=10;

dotenv.config()

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["POST", "GET", "DELETE", "PUT", "PATCH"],
    credentials: true
}));

app.use('/users', usersRouter)
app.use('/blogs', blogsRouter)
app.use('/reviews', reviewsRouter)
app.use('/profile', profileRouter)

app.use(cookieParser());

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

//------------- REGISTER, LOGIN, LOGOUT, MAIN PAGE ----------------

app.post("/register", (req,res)=>{
    const q="INSERT INTO users (`username`,`email`,`password`, `karma`, `role`, `joined`) VALUES (?)"
    bcrypt.hash(req.body.password.toString(), saltRounds, (err, hash)=>{
        if(err) {
            console.log(err); 
            return res.json({Error: "Error in password hashing."})
        };
        const values = [
            req.body.username,
            req.body.email,
            hash,
            req.body.karma,
            req.body.role,
            req.body.joined
        ];
        db.query(q, [values], (err,data) => {
            if(err) {
                console.log(err); 
                return res.json({Error: "Inserting registered user data error."})
            };
            return res.json({Status: "Success"});
        })
    })
})

app.post("/login", (req, res) =>{
    const q = 'SELECT * FROM users WHERE email = ?';
    db.query(q,[req.body.email], (err, data) => {
        if(err) return res.json({Error: "Server login error"});
        if(data.length>0){
            bcrypt.compare(req.body.password.toString(), data[0].password, (err, resp) => {
                if(err) return res.json({Error: "Password comparing error"});
                if(resp){
                    const username = data[0].username;
                    const role = data[0].role;
                    const id = data[0].id;
                    const email = data[0].email;
                    const token = jwt.sign({username, role, id, email}, process.env.JWTSECRET, {expiresIn: "2h"});
                    res.clearCookie('token');
                    res.cookie('token', token);
                    return res.json({Status: "Success"});
                } else{
                    return res.json({Error: "Incorrect password."});
                }
            })
        } else{
            return res.json({Error: "Email doesn't exist."});
        }
    })
})

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({Status: "Success"});
})

app.get("/", getUser(), (req,res)=>{
    return res.json({Status: "Success", username: req.username, role: req.role});
})

//-----------------------------------------------------------------------

app.listen(process.env.PORT, ()=>{
    console.log("Connected to backend!")
});