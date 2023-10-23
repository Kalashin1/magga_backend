import { Entity, CreateDateColumn, UpdateDateColumn, ObjectIdColumn, ObjectId, Column } from "typeorm";
import { Product, Shop as ShopInterface } from "../types";

export const SHOP_STATUS = ["CREATED", "APPROVED", "BLOCKED", "SUSPENDED"]

@Entity()
export class Shops implements ShopInterface {
  @Column()
  name: string;

  @ObjectIdColumn()
  _id: ObjectId;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column()
  products: string[];

  @Column()
  email: string;
  
  @Column()
  password: string;
  
  @Column()
  phone: string;

  @Column({
    type: "enum",
    enum: SHOP_STATUS,
    default: SHOP_STATUS[0],
  })
  status: typeof SHOP_STATUS[number]

} 