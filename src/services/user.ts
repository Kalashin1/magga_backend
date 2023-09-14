import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import {CreateUserParam} from "../types";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AuthError } from "../errors/auth";

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
    user.role = role;
    user.token = this.generateToken({email, role, id: user.id});
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
    user.token = this.generateToken({username, role, id: user.id});
    user.role = role;
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
    user.token = this.generateToken({phone, role, id: user.id });
    user.role = role;
    await Users.save(user);
    return user;
  }

  async login({
    email,
    password
  }: Partial<CreateUserParam>) {
    const Users = await AppDataSource.getRepository(User);
    const user = await Users.findOneBy({
      email: email,
    });
    if (!user) 
      throw new AuthError('login-email', 'no user with that email');
    
    const passwordVerified = await this.verifyPassword(password, user.password);
    if (!passwordVerified)
      throw new AuthError('login-password', 'incorrect password');

    user.token = this.generateToken({
      email,
      role: user.role,
      id: user.id
    });
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
    payload: Partial<Pick<User, 'email' | 'role' | 'username' | 'phone'| 'id'>>
  ) {
    return jwt.sign(payload, '1234');
  }

  decodeToken(token: string) {
    return jwt.decode(token);
  }

  verifyToken(token: string) {
    return jwt.verify(token, '1234')
  }
}