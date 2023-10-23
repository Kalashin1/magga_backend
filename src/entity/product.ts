import { Entity, Column, CreateDateColumn, UpdateDateColumn, ObjectIdColumn, ObjectId } from "typeorm";
import { Product as ProductInterface } from "../types";

@Entity()
export class Product implements ProductInterface {

  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column()
  shop: string;

  @Column()
  price: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column()
  category: string;

  @Column()
  subCategory: string;

}