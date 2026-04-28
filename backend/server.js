import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDB } from './config/db.js';
import router from './routes/userRoute.js';
import subRouter from './routes/subroute.js';
import orderRouter from './routes/orderroute.js';
const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('hello world');
});

app.use('/auth', router);
app.use('/sub', subRouter);
app.use('/orders', orderRouter);
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'page not found'
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'something broke!'
    });
});

app.listen(port, () => {
    console.log(`server is running on ${port}`);
});
