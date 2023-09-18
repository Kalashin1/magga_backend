import * as express from 'express';
require('dotenv').config();
import { AppDataSource } from './data-source';
import UserRouter from './router/user';
import * as cors from 'cors'

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json())
app.use(UserRouter);

app.get('/', (req:express.Request, res: express.Response) => {
  res.end('Hello World')
})


AppDataSource.initialize().then(async () => {
  console.log('connected to the database')
  app.listen(PORT, () => {
    console.log(`app running on port ${PORT}`)
  })
}).catch(error => console.log(error))
