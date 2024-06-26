import express from 'express';
import bodyParser from 'body-parser';
import accountRoute from './routes/accountRoute';
import cors from 'cors';

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use('/account',accountRoute);

export default app;