import axios from "axios";
import rateLimit from 'express-rate-limit';
const app = require('express')();
import { v4 } from 'uuid';
require('dotenv').config();

app.get('/api', (req, res) => {
  const path = `/api/item/${v4()}`;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end(`Hello! Go to item: <a href="${path}">${path}</a>`);
});

app.get('/api/item/:slug', (req, res) => {
  const { slug } = req.params;
  res.end(`Item: ${slug}`);
});

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 15 minutes
	max: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true,
	legacyHeaders: false,
})

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

export default app;