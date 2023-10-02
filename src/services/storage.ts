import { Storage } from "@google-cloud/storage";
import path = require("path");
import * as crypto from "crypto";
import { UserDocuments } from "../types";
import * as Key from './key.json'
require("dotenv").config();

export class StorageService {
  private storage: Storage;
  constructor() {
    this.storage = new Storage({
      projectId: process.env.GOOGLE_PROJECT_ID,
      // keyFilename: path.join(__dirname + "../../../key.json"),
      keyFile: "./key.json"
    });
  }

  async logBuckets() {
    const [buckets] = await this.storage.getBuckets();
    return await buckets[0].getFiles();
  }
  

  async uploadFile(bucketName: string, buffer: Buffer, destFileName: string) {
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
    file: Buffer;
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

  boostrapFile(file) {
    const key = crypto.randomBytes(32).toString("hex");

    const [, extension] = file.originalname.split(".");

    const uploadParams = {
      fileName: `${key}.${extension}`,
      Body: file.buffer,
    };

    return { uploadParams, key, extension };
  }
}
