import { User, UserRoleType } from "../entity/User";
import { AppDataSource } from "../data-source";
import {
  AuthUser,
  BankDetails,
  CreateUserParam,
  Document,
  DocumentStatus,
  ReferrerType,
  StandIn,
  userDocumentsArray,
} from "../types";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { AuthError } from "../errors/auth";
import { ObjectId } from "mongodb";
import { Trades } from "../entity/trades";
import { NotificationService } from "./notifications";
require("dotenv").config();

export class UserService {

  constructor(
    private notificationService: NotificationService
  ) {}

  async createUser({
    email,
    password,
    username,
    phone,
    role,
    first_name,
    last_name,
    position,
  }: Partial<CreateUserParam>) {
    const Users = await AppDataSource.getRepository(User);
    const user = await Users.create({
      email: email?.toLocaleLowerCase()?.trim(),
      password: await this.hashPassword(password),
      role: role,
      phone: phone?.trim(),
      username: username?.trim(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      position,
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
    const appSource = await AppDataSource.mongoManager;
    let user: Partial<User>;
    if (email) {
      user = await appSource.findOne(User, {
        where: {
          email: email.toLocaleLowerCase(),
        },
      });
      if (!user) throw new AuthError("login-email", "incorrect email");
    } else if (phone) {
      user = await appSource.findOne(User, {
        where: {
          phone: phone,
        },
      });
      if (!user) throw new AuthError("login-email", "incorrect phone");
    } else {
      user = await appSource.findOne(User, {
        where: {
          username,
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
    await appSource.save(User, user);
    await this.notificationService.create(
      'Recent login to your dashboard',
      'Auth',
      user._id.toString(),
    )
    return user;
  }

  async generateId(role: UserRoleType, referrer: ObjectId) {
    const user = await this.getUser({ _id: referrer });
    if (!user) throw Error("Your referrer is invalid");
    if (role === "contractor" && user.role !== "admin") {
      throw Error("Invalid operation, you do not have the privillages");
    }
    if (role === "executor" && (user.role !== "contractor")) {
      throw Error("Invalid operation, you do not have the privillages");
    }

    let userObj = {
      email: user.email,
      id: user._id,
      role: user.role,
    };
    const subUser = await AppDataSource.mongoManager.create(User, {
      creator: userObj,
      role,
    });
    await AppDataSource.mongoManager.save(User, subUser);
    await this.notificationService.create(
      'You have successfully created a new sub user account',
      'Sub Account Creation',
      user._id.toString()
    )
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
    await this.notificationService.create(
      'You recently requested a password reset token',
      'Auth',
      user._id.toString()
    )
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
    const user = await Users.findOne({
      where: {
        resetPasswordToken,
        email,
      },
    });
    if (!user) throw new AuthError("update-password", "no user with that code");
    user.password = await this.hashPassword(password);
    await Users.save(user);
    await this.notificationService.create(
      'Your password has been updated successfully',
      'Auth',
      user._id.toString()
    )
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
    documents,
    logoUrl,
    address,
    socialSecurityNumber,
    taxIdNumber
  }: Partial<Omit<AuthUser, "bankDetails">> & { bankDetails?: BankDetails }) {
    const user = await this.getUser({ _id });
    if (!user)
      throw new AuthError("user-profile-update", "no user with that id");
    user.first_name = first_name;
    user.last_name = last_name;
    console.log("bank details", bankDetails);
    
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (username) user.username = username;
    if (avatar) user.avatar = avatar;
    const existingBankDetails = user.bankDetails ?? [];
    if (bankDetails) user.bankDetails = [bankDetails, ...existingBankDetails];
    if (billingDetails) user.billingDetails = billingDetails;
    if (numberRanges) user.numberRanges = numberRanges;
    if (numberRangesLocal) user.numberRangesLocal = numberRangesLocal;
    if (documents) user.documents = documents;
    if (logoUrl) user.logoUrl = logoUrl;
    if (address) user.address = address;
    if (socialSecurityNumber) user.socialSecurityNumber = socialSecurityNumber
    if (taxIdNumber) user.taxIdNumber = taxIdNumber;

    user.token = await this.generateToken({
      email,
      _id: user._id,
      role: user.role,
    });
    await AppDataSource.mongoManager.save(user);
    await this.notificationService.create(
      'Your profile has been updated successfully!',
      'Profile-Update',
      user._id.toString()
    )
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

  searchEmployee({email, name, role }: {
    name: string;
    email: string;
    role: 'employee'
  }) {
    return AppDataSource.mongoManager.find(User, {
      where: {
        role,
        or: [{ email }, {first_name: name.substring(0, name.indexOf(' '))}]
      }
    })
  }

  async updateDocument(
    _id: string, 
    status: DocumentStatus,
    name: typeof userDocumentsArray[number]
  ){
    const user = await this.getUser({ _id });
    const documents = user.documents;
    if (!documents) throw Error('this user has not uploaded any document');
    const document = documents.find((doc) => doc.name === name);
    if (!document) throw Error('No document with that Id');
    document.status = status;
    const filteredDocuments = documents.filter((doc) => doc.name !== name)
    user.documents = [document, ...filteredDocuments]
    const updatedUser = await AppDataSource.mongoManager.save(User, user);
    await this.notificationService.create(
      'Your document has been updated successfully!',
      'Profile-Update',
      user._id.toString()
    )
    return {user, document}
  }

  async assignStandIn({ _id, email, role }: StandIn, owner_id: string) {
    const employee = await this.getUser({ _id });
    console.log(employee)
    if (!employee) throw Error("No employee with that Id");
    const owner = await this.getUser({_id: owner_id });
    if (!owner) throw Error("No user with that Id");
    console.log(employee.creator.id.toString() !== owner._id.toString())
    if (employee.creator.id.toString() !== owner._id.toString())
      throw Error("Employee is not assigned");
    if (employee.role !== "employee")
      throw Error("This user is not an employee");
    const existingStandIns = owner.standIn ?? [];
    owner.standIn = [
      {
        _id,
        email,
        role,
      },
      ...existingStandIns,
    ];
    await AppDataSource.mongoManager.save(User, owner);
    await this.notificationService.create(
      'Stand in has been assigned successfully',
      'Stand-In',
      owner._id.toString()
    )
    await this.notificationService.create(
      'You have been assigned as a stand-in',
      'Stand-In',
      _id
    )
    return employee;
  }

  async retrieveStandIn(owner_id: string) {
    const owner = await this.getUser({ _id: owner_id });
    return owner.standIn ?? [];
  }

  async deleteStandIn(owner_id: string, employee_id: string) {
    const owner = await this.getUser({ _id: owner_id });
    if (!owner || owner.role == "employee")
      throw Error("You cannot take this action");
    const existingStandIns = owner.standIn;
    const updatedStandIns = existingStandIns.filter(
      (extStd) => extStd._id.toString() !== employee_id
    );
    owner.standIn = updatedStandIns;
    await AppDataSource.mongoManager.save(User, owner);
    await this.notificationService.create(
      'Stand in has been deleted successfully',
      'Stand-In',
      owner._id.toString()
    )
    await this.notificationService.create(
      'You have been unassigned as a stand-in',
      'Stand-In',
      employee_id
    )
    return owner;
  }

  async updateBankDetails(
    owner_id: string,
    existingDetails: BankDetails,
    newDetails: BankDetails
  ) {
    const owner = await this.getUser({ _id: owner_id });
    const bankDetails = owner.bankDetails;
    let foundBankDetails = bankDetails.find(
      (bD) => bD.iban === existingDetails.iban
    );
    console.log("foundBankDetails", foundBankDetails);
    if (!foundBankDetails) throw Error("Existing bank details not found");
    const updatedBankDetails = bankDetails.filter(
      (bD) => bD.iban !== foundBankDetails.iban
    );
    foundBankDetails = newDetails;
    updatedBankDetails.push(foundBankDetails);
    owner.bankDetails = updatedBankDetails;
    await AppDataSource.mongoManager.save(User, owner);
    await this.notificationService.create(
      'Bank Details updated successfully',
      'Profile-Update',
      owner._id.toString()
    )
    return owner;
  }

  save(user: User){
    return AppDataSource.mongoManager.save(User, user);
  }

  async deleteBankDetails(owner_id: string, existingBankDetails: BankDetails) {
    const owner = await this.getUser({ _id: owner_id });
    const bankDetails = owner.bankDetails;
    let foundBankDetails = bankDetails.find(
      (bD) => bD.iban === existingBankDetails.iban
    );
    if (!foundBankDetails) throw Error("Existing bank details not found");
    const updateBankDetails = bankDetails.filter(
      (bD) => bD.iban !== existingBankDetails.iban
    );
    owner.bankDetails = updateBankDetails;
    console.log(updateBankDetails);
    await AppDataSource.mongoManager.save(User, owner);
    await this.notificationService.create(
      'Bank details deleted successfully!',
      'Profile-Update',
      owner_id,
    )
    return owner.bankDetails;
  }

  async addTrade(owner_id: string, tradeId: string) {
    console.log('owner_id', owner_id);
    console.log('tradeId', tradeId);
    const owner = await this.getUser({ _id: owner_id });
    const trade = await AppDataSource.mongoManager.findOne(Trades, {
      where: { _id: new ObjectId(tradeId) },
    });
    const existingTrades = owner.trades ?? [];
    const foundTrade = existingTrades.find((trade) => trade._id === tradeId);
    if (foundTrade) {
      return owner;
    }
    owner.trades = [trade, ...existingTrades];
    await AppDataSource.mongoManager.save(User, owner);
    await this.notificationService.create(
      'Trade assinged successfully!',
      'Trade',
      owner._id.toString()
    )
    return owner;
  }

  async removeTrades(owner_id: string, tradeId: string) {
    const owner = await this.getUser({ _id: owner_id });
    const existingTrades = owner.trades;
    const filteredTrade = existingTrades.filter((exT) => exT._id.toString() !== tradeId);
    owner.trades = filteredTrade;
    await AppDataSource.mongoManager.save(User, owner);
    await this.notificationService.create(
      'Trade has been deleted successfully',
      'Trade',
      owner_id
    )
    return owner;
  }

  async assingEmployee(owner_id: string, employee_id: string) {
    const owner = await this.getUser({ _id: owner_id });
    const employee = await this.getUser({ _id: employee_id });
    if (owner.role === "employee")
      throw Error("employee cannot create another employee");
    const existingEmployees = owner.employees ?? [];
    existingEmployees.push({
      id: employee._id,
      email: employee.email,
      role: employee.role,
      avatar: employee.avatar,
      first_name: employee.first_name,
      last_name: employee.last_name,
      phone: employee.phone,
      username: employee.username
    });
    const employeeCreator: ReferrerType = {
      email: owner.email,
      id: owner._id,
      role: owner.role,
      avatar: owner.avatar,
      first_name: owner.first_name,
      last_name: owner.last_name,
      phone: owner.phone,
      username: owner.username
    };
    owner.employees = existingEmployees;
    employee.creator = employeeCreator;
    await AppDataSource.mongoManager.save(User, employee);
    await AppDataSource.mongoManager.save(User, owner);
    await this.notificationService.create(
      'You have created a new employee account successfully',
      'Employee',
      employee_id
    )
    return { employee, owner };
  }

  async retrieveEmployees(owner_id: string) {
    const owner = await this.getUser({ _id: owner_id });
    const employees = owner.employees;
    return employees;
  }

  async deleteEmployee(ownerId: string, employee_id: string) {
    const owner = await this.getUser({ _id: ownerId });
    const employee = await this.getUser({ _id: employee_id });
    employee.creator = null;
    let existingEmployees = owner.employees;
    let filteredEmployees = existingEmployees.filter((employee) => employee.id != employee_id);
    owner.employees = filteredEmployees;
    await AppDataSource.mongoManager.save(User, employee);
    await AppDataSource.mongoManager.save(User, owner);
    await this.notificationService.create(
      `You have successfully deleted employee ${employee.first_name} ${employee.last_name}`,
      'Employee',
      employee_id
    )
    return {employee, owner};
  }

  async assingExecutor(owner_id: string, executor_id: string) {
    const owner = await this.getUser({ _id: owner_id });
    const executor = await this.getUser({ _id: executor_id });
    if (owner.role !== 'contractor')
      throw Error("only a contracor can create an executor");
    const existingExecutor = owner.executors ?? [];
    existingExecutor.push({
      id: executor._id,
      email: executor.email,
      role: executor.role,
      avatar: executor.avatar,
      first_name: executor.first_name,
      last_name: executor.last_name,
      phone: executor.phone,
      username: executor.username
    });
    const executorCreator: ReferrerType = {
      email: owner.email,
      id: owner._id,
      role: owner.role,
      avatar: owner.avatar,
      first_name: owner.first_name,
      last_name: owner.last_name,
      phone: owner.phone,
      username: owner.username
    };
    owner.executors = existingExecutor;
    executor.creator = executorCreator;
    await AppDataSource.mongoManager.save(User, executor);
    await AppDataSource.mongoManager.save(User, owner);
    await this.notificationService.create(
      'You have created a new executor account',
      'Executor',
      owner._id.toString()
    )
    return { executor, owner };
  }

  async retrieveExecutors(owner_id: string) {
    const owner = await this.getUser({ _id: owner_id });
    const employee = owner.executors;
    return employee;
  }

  async deleteExecutor(ownerId: string, executor_id: string) {
    const owner = await this.getUser({ _id: ownerId });
    const executor = await this.getUser({ _id: executor_id });
    executor.creator = null;
    let existingExecutors = owner.executors;
    let filteredExecutors = existingExecutors.filter((executor) => executor.id != executor_id);
    owner.executors = filteredExecutors;
    await AppDataSource.mongoManager.save(User, executor);
    await AppDataSource.mongoManager.save(User, owner);
    await AppDataSource.mongoManager.softDelete(User, executor)
    await this.notificationService.create(
      `You have succcesfully deleted executor ${executor._id} account`,
      'Executor',
      owner._id.toString()
    )
    return {executor, owner};
  }

  async completeRegistration(owner_id: string, subAccount_id: string){
    const owner = await this.getUser({ _id: owner_id });
    const subAccount = await this.getUser({ _id: subAccount_id });
    if (!owner || !subAccount) throw Error('owner account or sub-account does not exist.');
    subAccount.creator = {
      first_name: owner.first_name,
      last_name: owner.last_name,
      email: owner.email,
      role: owner.role,
      phone: owner.phone,
      username: owner.username,
      avatar: owner.avatar,
      id: owner._id,
    }
    if (subAccount.role === 'executor') {
      const executors = owner.executors ?? [];
      owner.executors = [subAccount, ...executors];
    }
    await AppDataSource.mongoManager.save(User, subAccount);
    await AppDataSource.mongoManager.save(User, owner);
    await this.notificationService.create(
      'You have successfully completed your profile',
      'Profile-Update',
      subAccount._id.toString()
    )
    return {subAccount, owner}
  }

  async getContractors() {
    const Users = AppDataSource.getMongoRepository(User);
    const contractors = await Users.find({
      where:{
        role: 'contractor'
      }
    }) 
    return contractors;
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


const notificationService = new NotificationService()
const userService = new UserService(notificationService);

export default userService;