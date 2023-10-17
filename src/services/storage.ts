import { Storage } from "@google-cloud/storage";
import path = require("path");
import * as crypto from "crypto";
import { UserDocuments, userDocumentsArray } from "../types";
import * as Key from "./key.json";
import { AppDataSource } from "../data-source";
import { User, UserRoleType } from "../entity/User";
import { ObjectId } from "mongodb";
// import * as PDFParser from "pdf2json";
require("dotenv").config();

export class StorageService {
  storage: Storage;
  constructor() {
    this.storage = new Storage({
      projectId: process.env.GOOGLE_PROJECT_ID,
      keyFilename: path.join(__dirname + "../../../key.json"),
      // keyFile: "./key.json",
    });
  }

  async logBuckets() {
    const [buckets] = await this.storage.getBuckets();
    return await buckets[0].getFiles();
  }

  async uploadFile(
    bucketName: string,
    buffer: Buffer | string,
    destFileName: string
  ) {
    const file = await this.storage.bucket(bucketName).file(destFileName);
    await file.save(buffer);
    await file.makePublic();
    const publicUrl = await file.publicUrl();
    const message = `file uploaded to ${bucketName}!`;
    return { message, publicUrl };
  }

  async uploadAsset({
    extension,
    first_name,
    last_name,
    _id,
    file,
    folder,
  }: {
    first_name: string;
    last_name: string;
    _id: string;
    extension: string;
    file: Buffer | string;
    folder: string;
  }) {
    try {
      const response = await this.uploadFile(
        process.env.BUCKET_NAME,
        file,
        `${first_name}-${last_name}-${_id}/${folder}/${_id}.${extension}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
  async uploadProject(
    project_id: string,
    file: Buffer | string,
    folder: string,
    extension: string
  ) {
    try {
      const response = await this.uploadFile(
        process.env.BUCKET_NAME,
        file,
        `${folder}/${project_id}/${project_id}.${extension}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  boostrapFile(file) {
    const key = crypto.randomBytes(32).toString("hex");

    const [, extension] = file.originalname.split(".");

    const uploadParams = {
      fileName: `${key}.${extension}`,
      Body: file.buffer,
    };

    return { uploadParams, key, extension };
  }

  parseFileTree(string: string) {
    const levels = string.split("/");
    const fileTree = {
      name: levels[0],
      children: [],
    };
    for (let i = 1; i < levels.length; i++) {
      if (!levels[i]) continue;
      const fileTreeNode = {
        name: levels[i],
        children: [],
      };
      fileTree.children.push(fileTreeNode);

      if (i !== levels.length - 1) {
        fileTreeNode["parent"] = fileTree.name;
      }
    }
    return fileTree;
  }

  parseFileTreeWithChildren(string, children) {
    const levels = string.split("/");
    const fileTree = {
      name: levels[0],
      children: [],
    };
    for (let i = 1; i < levels.length; i++) {
      if (!levels[i]) continue;
      let fileTreeNode;
      if (levels.length > 1) {
        fileTreeNode = {
          name: levels[i],
          children: [],
        };
        fileTree.children.push(fileTreeNode);
      } else {
        fileTreeNode = {
          name: levels[i],
          children: children
            ? children.map((c) => ({ name: c, children: [] }))
            : [],
        };
        fileTree.children.push(fileTreeNode);
      }
      fileTreeNode["parent"] = fileTree.name;
      if (i !== levels.length - 1) {
      }
    }
    return fileTree;
  }

  parseFileTrees(strings: string[], children?: string[]) {
    const fileTrees = [];
    let fileTree;
    for (const string of strings) {
      if (!string) continue;
      if (children) {
        fileTree = this.parseFileTreeWithChildren(string, children);
      } else {
        fileTree = this.parseFileTree(string);
      }
      fileTrees.push(fileTree);
      console.log(fileTrees);
    }
    return fileTrees;
  }

  async parsePDF(pdf:Buffer){
    //@ts-ignore
    // const pdfParser = new PDFParser();
    // pdfParser.parseBuffer(pdf);
    // pdfParser.on("pdfParser_dataError", errData => console.error(errData) );
    // pdfParser.on("readable", meta => console.log("PDF Metadata", meta) );
    // pdfParser.on("data", page => console.log(page ? "One page paged" : "All pages parsed", page));
    // pdfParser.on("error", err => console.error("Parser Error", err));
  }

  async getUsersFolders(role: string) {
    const users = await AppDataSource.mongoManager.find(User, {
      where: {
        role,
      },
    });
    const urls = users.map((emp) => {
      if (emp.first_name && emp.last_name) {
        return this.generateFolders(
          emp.first_name,
          emp.last_name,
          emp._id.toString()
        );
      }
    });

    const folders = this.parseFileTrees(urls);
    return folders;
  }

  generateFolders(
    first_name: string,
    last_name: string,
    id: string,
    role?: UserRoleType
  ) {
    let str = `${first_name}-${last_name}-${id}/profile-photo/`;
    if (role && role === "employee") {
      return str;
    } else {
      userDocumentsArray.forEach((userDocArr) => {
        str += `${userDocArr}/`;
      });
      return str;
    }
  }

  async listAllFiles(bucket: string, prefix: string) {
    console.log(prefix);
    const files = await this.storage.bucket(bucket).getFiles({
      prefix,
    });
    console.log(files);
    return files[0].map((file) => file.metadata);
  }

  async getEmployeesFolder(owner_id: string) {
    const owner = await AppDataSource.mongoManager.findOneBy(User, {
      _id: new ObjectId(owner_id),
    });

    const employees = owner.employees || [];
    const employeesFolderStrings = employees.map((emp) =>
      this.generateFolders(
        emp.first_name,
        emp.last_name,
        emp.id.toString(),
        "employee"
      )
    );
    const folders = this.parseFileTrees(employeesFolderStrings);
    return folders;
  }

  async getExecutorsFolders(owner_id: string) {
    const owner = await AppDataSource.mongoManager.findOneBy(User, {
      _id: new ObjectId(owner_id),
    });
    const executors = owner.executors || [];
    const executorsFolderStrings = executors.map((emp) =>
      this.generateFolders(emp.first_name, emp.last_name, emp.id.toString())
    );
    const folders = this.parseFileTrees(executorsFolderStrings);
    return folders;
  }
}


const storageService = new StorageService();

export default storageService;