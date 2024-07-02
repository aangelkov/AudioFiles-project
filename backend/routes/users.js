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

router.get("/", verifyUser(["admin"]), (req,res)=>{
    const q = "SELECT * FROM users"
    db.query(q, (err,data)=>{
        if(err) return res.json({Error:"Fetching users error"})
        return res.json({Status: "Success", data, username: req.username, id: req.id, role: req.role})
    })
})

router.get("/:id", verifyUser(["admin"]), (req,res)=>{
    const userId = req.params.id.slice(1);
    const q = "SELECT * FROM users WHERE id = ?"
    db.query(q, [userId], (err,data)=>{
        if(err) {
            console.log(err);
            return res.json({Error: "Fetching user data error"});
        }
        return res.json({Status: "Success", data, username: req.username, role: req.role})
    })
})

router.delete("/:id", verifyUser(["admin"]), (req,res)=>{
    const userId = req.params.id.slice(1);
    const q = "DELETE FROM users WHERE id = ?"
    db.query(q,[userId], (err,data)=>{
        if(err) return res.json({Error: "There was an error deleting the user profile"});
        return res.json({Status: "Success"});
    })
})

router.patch("/:id", verifyUser(["admin"]), (req,res)=>{
    const userId = req.params.id.slice(1);
    const q = "UPDATE users SET username=?, email=?, password=?, role=? WHERE id=?"
     bcrypt.hash(req.body[2].toString(), saltRounds, (err, hash)=>{
        if(err) {
            console.log(err); 
            return res.json({Error: "Error in password hashing."})
        };
        const values = [
            req.body[0],
            req.body[1],
            hash,
            req.body[3],
            userId 
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

router.get("/add", verifyUser(["admin"]), (req,res)=>{
    return res.json({Status: "Success", data, username: req.username, role: req.role})
})

router.post("/", verifyUser(["admin"]), (req,res)=>{
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

export default router;