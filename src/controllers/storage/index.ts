import { Request, Response } from "express";
import { StorageService } from "../../services/storage";
import { UserService } from "../../services/user";
import { LogoUrl, UserDocuments } from "../../types";

const storage = new StorageService();
const userService = new UserService();

export const showAllBuckets = async (req: Request, res: Response) => {
  try {
    const buckets = await storage.logBuckets();
    return res.json(buckets);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const uploadProfilePhoto = async (req: Request, res: Response) => {
  const { _id } = req.params;

  const imageMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg"];

  const mimeType = imageMimeTypes.find((mT) => mT === req.file.mimetype);

  console.log(mimeType);

  if (req.file && !mimeType) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    return res.json({ message: "Only images allowed!" });
  } else {
    try {
      const {
        extension,
        uploadParams: { Body },
      } = storage.boostrapFile(req.file);
      const user = await userService.getUser({ _id });
      const response = await storage.uploadAsset({
        extension,
        first_name: user.first_name,
        last_name: user.last_name,
        _id: user._id.toString(),
        folder: "profile-photo",
        file: Body,
      });
      await userService.updateProfile({ avatar: response.publicUrl, _id });
      user.avatar = response.publicUrl;
      return res.json({ ...response, user });
    } catch (error) {
      return res.status(400).json(error);
    }
  }
};

export const uploadDocument = async (req: Request, res: Response) => {
  const { _id, document } = req.params;

  const mimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg", "application/pdf"];

  const mimeType = mimeTypes.find((mT) => mT === req.file.mimetype);

  if (req.file && !mimeType) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    return res.json({ message: "Only images & PDF's allowed!" });
  }

  try {
    const {
      extension,
      uploadParams: { Body },
    } = storage.boostrapFile(req.file);
    const user = await userService.getUser({ _id });
    const response = await storage.uploadAsset({
      extension,
      first_name: user.first_name,
      last_name: user.last_name,
      _id: user._id.toString(),
      folder: document,
      file: Body,
    });
    const userDocuments = user.documents ?? {} as UserDocuments;
    userDocuments[`${document}`] = response.publicUrl;
    await userService.updateProfile({ documents: userDocuments, _id });
    user.documents = userDocuments;
    return res.json({ ...response, user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const uploadLogo = async (req: Request, res: Response) => {
  const { _id, logoType } = req.params;

  console.log("_id", _id);
  console.log("logoType", logoType);

  const imageMimeTypes = ["image/png", "image/jpeg", "image/svg"];

  const mimeType = imageMimeTypes.find((mT) => mT === req.file.mimetype);

  if (req.file && !mimeType) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    return res.json({ message: "Only images allowed!" });
  }

  try {
    const {
      extension,
      uploadParams: { Body },
    } = storage.boostrapFile(req.file);
    const user = await userService.getUser({ _id });
    const response = await storage.uploadAsset({
      extension,
      first_name: user.first_name,
      last_name: user.last_name,
      _id: user._id.toString(),
      folder: logoType,
      file: Body,
    });
    const existingLogoURL = user.logoUrl ?? ({} as LogoUrl);
    existingLogoURL[`${logoType}`] = response.publicUrl;
    await userService.updateProfile({
      _id,
      logoUrl: existingLogoURL,
    });
    user.logoUrl = existingLogoURL as LogoUrl;
    return res.json(user);
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const getAllEmployeesFolder = async (req: Request, res: Response) => {
  const {role} = req.params;
  try {
    const users = await storage.getUsersFolders(role);
    return res.json(users)
  } catch (error) {
    return res.json({ message: error.message });
  }
}
export const getFiles = async (req: Request, res: Response) => {
  const {prefix} = req.body;
  try {
    const files = await storage.listAllFiles(process.env.BUCKET_NAME, prefix);
    return res.json(files);
  } catch (error) {
    return res.json({message: error.message})
  }
}
