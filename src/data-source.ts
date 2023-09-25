import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Trades } from "./entity/trades";
require("dotenv").config();

export const AppDataSource = new DataSource({
  type: "mongodb",
  url: process.env.DB_URL,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  synchronize: false,
  entities: [User, Trades],
});
