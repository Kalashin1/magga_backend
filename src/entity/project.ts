import { Entity, Column, ObjectId, ObjectIdColumn, UpdateDateColumn, CreateDateColumn } from "typeorm";

@Entity()
class Project {

  @ObjectIdColumn()
  _id: ObjectId

  @Column()
  externalId: string

  @CreateDateColumn()
  createdAt: string

  @UpdateDateColumn()
  updatedAt: string
}