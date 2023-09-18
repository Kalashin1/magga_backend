import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
require('dotenv').config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "db4free.net",
    port: 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
})
