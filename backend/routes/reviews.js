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
    const q = "SELECT reviews.id AS reviewId, reviews.title, reviews.product, reviews.product_type, reviews.date, reviews.brand, reviews.tags, users.username, users.id AS userId, users.role FROM reviews LEFT JOIN users ON reviews.review_owner_id = users.id"
    db.query(q, (err,data)=>{
        if(err) return res.json({Error:"Fetching data error", username: req.username, role: req.role})
        return res.json({Status: "Success", data, username: req.username, role: req.role})
    })
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