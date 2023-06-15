import express from "express";
import ViteExpress from "vite-express";
import axios from "axios";
import dotenv from "dotenv"
import rateLimit from 'express-rate-limit'

const app = express();
ViteExpress.config({ mode: "production" });
dotenv.config();

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 15 minutes
	max: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true,
	legacyHeaders: false,
})

// Apply the rate limiting middleware to all requests
app.use("/temp", limiter)

app.get("/temp", (req, res) => {
    const params = req.query;
    // @ts-ignore
    const KEY = process.env.VITE_KEY;
    // @ts-ignore
    axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${KEY}&q=${params.lat},${params.lng}&days=7`, {headers: {}}).then(dataresponse => {
        res.json(dataresponse.data);
    }).catch(error => {
        res.status(500).json(error);
    });
});

ViteExpress.listen(app, 3000, () =>
    console.log("Server is listening on port 3000...")
);