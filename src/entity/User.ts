import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
export type UserRoleType = "admin" | "contractor" | "executor" | "employee";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column()
    email: string;
    
    @Column()
    password: string;

    @Column()
    phone: string;

    @Column()
    username: string;

    @Column()
    token: string;

		@Column({
			type: "enum",
			enum: ["admin", "contractor", "executor", "employee"],
			default: "employee"
		})
		role: UserRoleType

		@CreateDateColumn()
		createdAt: string;

		@UpdateDateColumn()
		updatedAt: string;
}
