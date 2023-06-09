import axios from "axios";
import rateLimit from "express-rate-limit";
import express from "express"
// const fetch = require("node-fetch");
// import { v4 } from 'uuid';

const app = express();

import dotenv from 'dotenv'
dotenv.config();

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 15 minutes
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
});

app.use("/api", limiter);

app.get("/api", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    const params = req.query;
    // @ts-ignore
    const KEY = process.env.VITE_KEY;
    // @ts-ignore
    axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${KEY}&q=${params.lat},${params.lng}&days=7`, {headers: {}}).then(dataresponse => {
        res.json(dataresponse.data);
    }).catch((error) => {
        res.status(500).json(error);
    });
    // fetch(`https://api.weatherapi.com/v1/forecast.json?key=${KEY}&q=${params.lat},${params.lng}&days=7`).then(dataresponse => {
    //     res.json(dataresponse.data);
    // }).catch(error => {
    //     res.status(500).json(error);
    // });
});

export default app;