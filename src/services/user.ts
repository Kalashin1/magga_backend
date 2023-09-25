import { User, UserRoleType } from "../entity/User";
import { AppDataSource } from "../data-source";
import { AuthUser, BankDetails, CreateUserParam, ReferrerType, StandIn } from "../types";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { AuthError } from "../errors/auth";
import { ObjectId } from "mongodb";
import { Trades } from "../entity/trades";
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
          username: { $eq: username },
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

  async generateId(role: UserRoleType, referrer: ObjectId) {
    const user = await this.getUser({ _id: referrer });
    if (!user) throw Error("Your referrer is invalid");
    if (role === "contractor" && user.role !== 'admin') {
      throw Error('Invalid operation, you do not have the privillages')
    }
    if (role === "executor" && (user.role !== 'admin' || 'contractor') ) {
      throw Error('Invalid operation, you do not have the privillages')
    }

    let userObj = {
      email: user.email,
      id: user._id,
      role: user.role,
    };
    const subUser = await AppDataSource.mongoManager.create(User, {creator: userObj, role });
    await AppDataSource.mongoManager.save(User, subUser);
    return subUser;
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
        email,
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
    bankDetails,
    billingDetails,
    numberRanges,
    numberRangesLocal,
  }: Partial<Omit<AuthUser, 'bankDetails'>> & { bankDetails?: BankDetails}) {
    const user = await this.getUser({ _id });
    if (!user)
      throw new AuthError("user-profile-update", "no user with that id");
    user.first_name = first_name;
    user.last_name = last_name;
    const existingEmail = await this.getUser({ email });
    console.log('bank details', bankDetails);
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
    const existingBankDetails = user.bankDetails ?? [];
    if (bankDetails) user.bankDetails = [bankDetails, ...existingBankDetails];
    if (billingDetails) user.billingDetails = billingDetails;
    if (numberRanges) user.numberRanges = numberRanges;
    if (numberRangesLocal) user.numberRangesLocal = numberRanges;
    user.token = await this.generateToken({
      email,
      _id: user._id,
      role: user.role,
    });
    await AppDataSource.mongoManager.save(user);
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
            [key]: payload[key],
          },
        });
      }
    }
  }

  async assignStandIn({
    _id,
    email,
    role
  }: StandIn, owner_id: string) {
    const employee = await this.getUser({ _id });
    if (!employee) throw Error('No employee with that Id');
    const owner = await this.getUser({ _id: owner_id });
    if (!owner) throw Error('No employee with that Id');
    if (employee.creator.id !== owner_id) throw Error('Employee is not assigned');
    if (employee.role !== 'employee') throw Error('This user is not an employee');
    const existingStandIns = owner.standIn ?? [];
    owner.standIn = [{ 
      _id, 
      email, 
      role 
    }, ...existingStandIns];
    await AppDataSource.mongoManager.save(User, owner);
    return employee;
  }

  async retrieveStandIn(owner_id: string) {
    const owner = await this.getUser({ _id: owner_id });
    return owner.standIn ?? [];
  }

  async deleteStandIn(owner_id: string, employee_id: string) {
    const owner = await this.getUser({_id: owner_id});
    if (!owner || owner.role == 'employee') throw Error('You cannot take this action');
    const existingStandIns = owner.standIn; 
    const updatedStandIns = existingStandIns.filter((extStd) => extStd._id !== employee_id);
    owner.standIn = updatedStandIns;
    await AppDataSource.mongoManager.save(User, owner);
    return owner
  }

  async updateBankDetails(owner_id: string, existingDetails: BankDetails, newDetails: BankDetails) {
    const owner = await this.getUser({_id: owner_id});
    const bankDetails = owner.bankDetails;
    let foundBankDetails = bankDetails.find((bD) => bD.iban === existingDetails.iban);
    console.log("foundBankDetails",foundBankDetails)
    if (!foundBankDetails) throw Error('Existing bank details not found')
    const updatedBankDetails = bankDetails.filter((bD) => bD.iban !== foundBankDetails.iban);
    foundBankDetails = newDetails;
    updatedBankDetails.push(foundBankDetails);
    owner.bankDetails = updatedBankDetails;
    await AppDataSource.mongoManager.save(User, owner);
    return owner;
  }

  async deleteBankDetails(owner_id: string, existingBankDetails: BankDetails) {
    const owner = await this.getUser({ _id: owner_id });
    const bankDetails = owner.bankDetails;
    let foundBankDetails = bankDetails.find((bD) => bD.iban === existingBankDetails.iban);
    if (!foundBankDetails) throw Error('Existing bank details not found')
    const updateBankDetails = bankDetails.filter((bD) => bD.iban !== existingBankDetails.iban);
    owner.bankDetails = updateBankDetails;
    console.log(updateBankDetails);
    await AppDataSource.mongoManager.save(User, owner);
    return owner.bankDetails;
  }

  async addTrade(owner_id: string, tradeId: string) {
    const owner = await this.getUser({ _id: owner_id });
    const trade = await AppDataSource.mongoManager.findOne(Trades, { where: {_id: new ObjectId(tradeId)}});
    owner.trades = [trade, ...owner.trades];
    await AppDataSource.mongoManager.save(User, owner);
    return owner;
  }

  async removeTrades(owner_id: string, tradeId: string) {
    const owner = await this.getUser({ _id: owner_id });
    const existingTrades = owner.trades;
    const filteredTrade = existingTrades.filter((exT) => exT._id !== tradeId);
    owner.trades = filteredTrade;
    await AppDataSource.mongoManager.save(User, owner);
    return owner;
  }

  async assingEmployee(owner_id: string, employee_id: string) {
    const owner = await this.getUser({_id: owner_id});
    const employee = await this.getUser({_id: employee_id});
    if (owner.role === 'employee') throw Error('employee cannot create another employee')
    const employeeCreator:ReferrerType = {
      email: owner.email,
      id: owner._id,
      role: owner.role,
      generatedAt: new Date().getTime().toString()
    }
    employee.creator = employeeCreator;
    await AppDataSource.mongoManager.save(User, employee);
    return { employee, owner }
  }

  async retrieveEmployees(owner_id:  string) {
    const owner = await this.getUser({ _id: owner_id });
    const employees = await AppDataSource.mongoManager.find(User, {creator: {
      email: owner.email,
      role: owner.role,
      id: owner._id
    }})
    return employees;
  }

  async deleteEmployee(ownerId: string, employee_id: string) {
    const owner = await this.getUser({ _id: ownerId});
    const employee = await this.getUser({_id: employee_id});
    employee.creator = null;
    await AppDataSource.mongoManager.save(User, employee);
    return employee;
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
