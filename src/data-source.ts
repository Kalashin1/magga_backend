import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Trades } from "./entity/trades";
import { Position } from "./entity/position";
import { Contract } from "./entity/contract";
import { Project } from "./entity/project";
import { Notification } from "./entity/notification";
import { Shops } from "./entity/shop";
import { Product } from "./entity/product";
import { Draft } from "./entity/draft";
import { Invoice } from "./entity/invoice";
import { Message } from "./entity/message";
require("dotenv").config();

export const AppDataSource = new DataSource({
  type: "mongodb",
  url: process.env.DB_URL,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  synchronize: false,
  entities: [
    User,
    Trades,
    Position,
    Contract,
    Project,
    Notification,
    Shops,
    Product,
    Draft,
    Invoice,
    Message,
  ],
});
