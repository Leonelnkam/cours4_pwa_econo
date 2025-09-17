import express from 'express'; 
import morgan from 'morgan'; 
import helmet from 'helmet'; 
import cors from 'cors'; 
import dotenv from 'dotenv'; 
import productsRouter from './routes/products.routes.js'; 
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js'; 
 
dotenv.config(); 
const app = express(); 
 
app.use(helmet()); 
app.use(express.json()); 
app.use(morgan('dev')); 
app.use(cors({ origin: (o, cb) => cb(null, true), credentials: true })); 
 
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() 
})); 
app.use('/api/products', productsRouter); 
 
app.use(notFoundHandler); 
app.use(errorHandler); 
export default app;