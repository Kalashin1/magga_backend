import express from 'express';
require('dotenv').config();
import { AppDataSource } from './data-source';
import UserRouter from './router/user';
import TradeRouter from './router/trades';
import StorageRouter from './router/storage';
import NotificationRouter from './router/notifications'
import ContractRouter from './router/contracts'; 
import PositionRouter from './router/positions';
import ProjectRouter from './router/projects';
import DraftRouter from './router/drafts';
import InvoiceRouter from './router/invoice';
import cors from 'cors';
import multer from 'multer';

const PORT = process.env.PORT;
const app = express();

const upload = multer({ storage: multer.memoryStorage() })

app.use(cors());
app.use(express.json({ limit: '50mb'}))
app.use(UserRouter);
app.use(TradeRouter);
app.use(StorageRouter);
app.use(NotificationRouter);
app.use(ContractRouter);
app.use(PositionRouter);
app.use(ProjectRouter);
app.use(DraftRouter);
app.use(InvoiceRouter)

app.get('/', (req:express.Request, res: express.Response) => {
  res.end('Hello World')
})


AppDataSource.initialize().then(async () => {
  console.log('connected to the database')
  app.listen(PORT, () => {
    console.log(`app running on port ${PORT}`)
  })
}).catch(error => console.log(error))
