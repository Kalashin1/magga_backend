import * as express from 'express';
require('dotenv').config();
import { AppDataSource } from './data-source';
import UserRouter from './router/user';
import TradeRoutes from './router/trades';
import StorageRoutes from './router/storage';
import * as cors from 'cors';
import * as multer from 'multer';

const PORT = process.env.PORT;
const app = express();

const upload = multer({ storage: multer.memoryStorage() })

app.use(cors());
app.use(express.json())
app.use(UserRouter);
app.use(TradeRoutes);
app.use(StorageRoutes);

app.get('/', (req:express.Request, res: express.Response) => {
  res.end('Hello World')
})


AppDataSource.initialize().then(async () => {
  console.log('connected to the database')
  app.listen(PORT, () => {
    console.log(`app running on port ${PORT}`)
  })
}).catch(error => console.log(error))
