import express from "express";
import dotenv from 'dotenv';
import mysql from "mysql2";
import {verifyUser, getUser} from "../middlewares.js";
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';

dotenv.config();

const saltRounds=10;

const router = express.Router();

router.use(cookieParser());

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

router.get("/", verifyUser(["admin", "moderator", "user"]), (req, res)=>{
    const q = "SELECT * from users WHERE id = ?"
    db.query(q,[req.id], (err, data)=>{
        if(err) return res.json({err})
        if(data.length>0){
            return res.json({Status: "Success", data})
        }else{
            return res.json({Error: "Fetching user data error"})
        }
    })
})

router.patch("/", verifyUser(["admin", "moderator", "user"]), (req, res) =>{
    const q = "UPDATE users SET username=?, email=?, password=? WHERE id=?"
    bcrypt.hash(req.body[2].toString(), saltRounds, (err, hash)=>{
        if(err) {
            console.log(err); 
            return res.json({Error: "Error in password hashing."})
        };
        const values = [
            req.body[0],
            req.body[1],
            hash,
            req.body[3]
        ];
        db.query(q, values, (err,data) => {
            if(err) {
                console.log(err); 
                return res.json({Error: "Updating user data error."})
            };
            return res.json({Status: "Success"});
        })
    })
})

router.delete("/", verifyUser(["admin", "moderator", "user"]), (req,res) =>{
    const q = "DELETE FROM users WHERE id=?"
    db.query(q,[req.id], (err, result)=>{
        if(err) {
            console.log(err); 
            return res.json({Error: "Delete user profile error"})
        }
        return res.json({Status: "Success"});  
    })
})


export default router;