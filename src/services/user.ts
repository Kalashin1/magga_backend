import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { AuthUser, CreateUserParam } from "../types";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { AuthError } from "../errors/auth";
import { ObjectId } from "mongodb";
require("dotenv").config();
export class UserService {
  async createUser({
    email,
    password,
    username,
    phone,
    role,
  }: Partial<CreateUserParam>) {
    const Users = await AppDataSource.getRepository(User);
    const user = await Users.create({
      email: email?.toLocaleLowerCase()?.trim(),
      password: await this.hashPassword(password),
      role: role,
      phone: phone?.trim(),
      username: username?.trim(),
    });
    user.token = this.generateToken({
      email,
      role,
      _id: user._id,
      phone,
      username,
    });
    await Users.save(user);
    console.log(user);
    return user;
  }

  async login({ email, phone, username, password }: Partial<CreateUserParam>) {
    const Users = await AppDataSource.getMongoRepository(User);
    console.log(email);
    let user: Partial<User>;

    if (email) {
      user = await Users.findOne({
        where: {
          email: { $eq: email },
        },
      });
      if (!user) throw new AuthError("login-password", "incorrect email");
    } else if (phone) {
      user = await Users.findOne({
        where: {
          phone: { $eq: phone },
        },
      });
      if (!user) throw new AuthError("login-password", "incorrect phone");
    } else {
      user = await Users.findOne({
        where: {
          phone: { $eq: email },
        },
      });
      if (!user) throw new AuthError("login-password", "incorrect username");
    }

    const passwordVerified = await this.verifyPassword(password, user.password);
    if (!passwordVerified)
      throw new AuthError("login-password", "incorrect password");

    user.token = this.generateToken({
      email,
      role: user.role,
      _id: user._id,
      phone: user.phone,
      username: user.username,
    });
    await Users.save(user);
    console.log(user);
    return user;
  }

  async requestPasswordResetCode({
    email,
    phone,
  }: Partial<Pick<User, "email" | "phone">>) {
    const Users = await AppDataSource.getMongoRepository(User);
    const token = await this.generatePasswordResetCode();
    let user: Partial<User>;
    if (email) {
      let user = await Users.findOne({
        where: {
          email: { $eq: email },
        },
      });
      console.log(user);
      user.resetPasswordToken = token;
      await AppDataSource.mongoManager.save(User, user);
      if (!user)
        throw new AuthError(
          "password-reset-code",
          "no account with that email"
        );
    } else if (phone && !user) {
      user = await Users.findOne({
        where: {
          phone: { $eq: phone },
        },
      });
      if (!user)
        throw new AuthError(
          "password-reset-code",
          "no account with that phone"
        );
      user.resetPasswordToken = token;
      await AppDataSource.mongoManager.save(User, user);
    }
    return token;
  }

  async updateUserPassword({
    email,
    phone,
    password,
    resetPasswordToken,
  }: Partial<
    Pick<User, "email" | "phone" | "password" | "resetPasswordToken">
  >) {
    const Users = await AppDataSource.getMongoRepository(User);
    console.table({ resetPasswordToken, password, email, phone });
    const user = await Users.findOne({
      where: {
        resetPasswordToken,
        email
      },
    });
    if (!user) throw new AuthError("update-password", "no user with that code");
    user.password = await this.hashPassword(password);
    await Users.save(user);
    return user;
  }

  async updateProfile({
    first_name,
    last_name,
    phone,
    email,
    username,
    avatar,
    _id,
  }: Partial<AuthUser>) {
    console.log(first_name, last_name, phone, username);
    const user = await this.getUser({ _id });
    if (!user)
      throw new AuthError("user-profile-update", "no user with that id");
    user.first_name = first_name;
    user.last_name = last_name;
    const existingEmail = await this.getUser({ email });
    console.log(existingEmail);
    if (existingEmail)
      throw new AuthError("email-update-error", "email already exists");
    if (email) user.email = email;
    const existingPhone = await this.getUser({ phone });
    if (existingPhone)
      throw new AuthError("phone-update-error", "phone number already exists");
    if (phone) user.phone = phone;
    const existingUsername = username && (await this.getUser({ username }));
    if (existingUsername)
      throw new AuthError("username-update-error", "username already exists");
    if (username) user.username = username;
    if (avatar) user.avatar = avatar;
    user.token = await this.generateToken({
      username,
      email,
      phone,
      _id: user._id,
      role: user.role,
    });
    await AppDataSource.manager.save(user);
    return user;
  }

  getUser(payload: Partial<AuthUser>) {
    for (const key in payload) {
      if (payload[key]) {
        if (key == "_id") {
          return AppDataSource.mongoManager.findOne(User, {
            where: {
              _id: new ObjectId(payload[key]),
            },
          });
        }
        return AppDataSource.mongoManager.findOne(User, {
          where: {
            key: payload[key],
          },
        });
      }
    }
  }

  hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  generateToken(
    payload: Partial<
      Pick<User, "email" | "role" | "username" | "phone" | "_id">
    >
  ) {
    return jwt.sign(payload, process.env.JWT_SECRETE, {
      expiresIn: 60 * 60 * 24 * 3,
    });
  }

  decodeToken(token: string) {
    return jwt.decode(token);
  }

  verifyToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRETE);
  }

  generatePasswordResetCode() {
    return Math.floor(Math.random() * 9999999);
  }
}
