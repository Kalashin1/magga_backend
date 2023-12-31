import { Entity, Column, CreateDateColumn, UpdateDateColumn, ObjectIdColumn, ObjectId } from "typeorm";
import { Product as ProductInterface } from "../types";

@Entity()
export class Product implements ProductInterface {

  @Column()
  imageUrls: string[];

  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

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

  @Column()
  external_id: string;

  @Column()
  description: string;
}