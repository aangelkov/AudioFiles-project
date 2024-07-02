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

router.get("/", getUser(), (req,res)=>{
    return res.json({Status:"Success", role: req.role, username:req.username})
})

router.get("/:id", getUser(), (req,res)=>{
    return res.json({Status:"Success", role: req.role, username:req.username})
})

router.delete("/:id", verifyUser(["admin", "moderator", "user"]), (req,res)=>{
    return res.json({Status:"Success", role: req.role, username:req.username})
})

router.put("/:id", verifyUser(["admin", "moderator", "user"]), (req,res)=>{
    return res.json({Status:"Success", role: req.role, username:req.username})
})


export default router;