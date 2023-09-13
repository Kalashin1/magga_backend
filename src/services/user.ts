import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import {CreateUserParam} from "../types";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export class UserService {
  async createUserWithEmailAndPassword({
    email, 
    password,
    role
  }: Pick<
    CreateUserParam, 'email' | 'password' | 'role'
  >) {
    const Users = await AppDataSource.getRepository(User);
    const user = await Users.create();
    user.email = email;
    user.password = await this.hashPassword(password);
    user.token = this.generateToken({email, role});
    await Users.save(user);
    return user;
  }
  
  async createUserWithUsernameAndPassword({
    username, 
    password,
    role
  }: Pick<
    CreateUserParam, 'username' | 'password' | 'role'
  >) {
    const Users = await AppDataSource.getRepository(User);
    const user = await Users.create();
    user.username = username;
    user.password = await this.hashPassword(password);
    user.token = this.generateToken({username, role });
    await Users.save(user);
    return user;
  }
  
  async createUserWithPhoneAndPassword({
    phone, 
    password,
    role
  }: Pick<
    CreateUserParam, 'phone' | 'password' | 'role'
  >) {
    const Users = await AppDataSource.getRepository(User);
    const user = await Users.create();
    user.phone = phone;
    user.password = await this.hashPassword(password);
    user.token = this.generateToken({phone, role });
    await Users.save(user);
    return user;
  }

  hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  generateToken(
    payload: Partial<Pick<User, 'email' | 'role' | 'username' | 'phone'>>
  ) {
    return jwt.sign(payload, '1234');
  }
}