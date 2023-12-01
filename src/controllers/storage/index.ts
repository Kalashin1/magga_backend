import { Request, Response } from "express";
import { StorageService } from "../../services/storage";
import { UserService } from "../../services/user";
import { Document, LogoUrl, userDocumentsArray } from "../../types";
import { NotificationService } from "../../services/notifications";
import ProductService from "../../services/products";
import projectService from "../../services/project";

const storage = new StorageService();
const userService = new UserService();
const notificationService = new NotificationService();

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
      await notificationService.create(
        "Your profile picture has been updated succesfully!",
        "Profile-Update",
        user._id.toString()
      );
      return res.json({ ...response, user });
    } catch (error) {
      return res.status(400).json(error);
    }
  }
};

export const uploadProductImages = async (req: Request, res: Response) => {
  const { shop_id, product_id } = req.params;
  const imageMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg"];

  const files = req.files as any[];
  console.log(req.files);

  files.forEach((file) => {
    const mimeType = imageMimeTypes.find((mT) => mT === file.mimetype);

    if (file && !mimeType) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      return res.json({ message: "Only images allowed!" });
    }
  });

  try {
    const shop = await userService.getUser({ _id: shop_id });
    if (!shop)
      return res
        .status(404)
        .json({ message: `Shop with ${shop_id} not found` });
    const product = await ProductService.getProductById(product_id);
    if (!product)
      return res
        .status(404)
        .json({ message: `Product with ${product_id} not found` });
    const existingImage = product.imageUrls ?? [];
    for (const file of files) {
      const {
        uploadParams: { Body },
        extension,
        key,
      } = storage.boostrapFile(file);
      const response = await storage.uploadFile(
        process.env.BUCKET_NAME,
        Body,
        `/shop/${shop_id}-${shop.first_name}/products/${product.name}-${product_id}/${extension}.${key}`
      );
      console.log(response);
      existingImage.push(response.publicUrl);
      console.log('ended')
    }
    console.log("existingImage", existingImage)
    const response = await ProductService.update(product_id, {
      imageUrls: existingImage,
    });
    console.log(response)
    return res.json(response);
  } catch (error) {
    return res.json({ message: error.message });
  }
};
export const uploadAddendumFile = async (req: Request, res: Response) => {
  const { project_id, order_id } = req.params;
  const imageMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg", "application/pdf"];

  const files = req.files as any[];
  console.log(req.files);

  files.forEach((file) => {
    const mimeType = imageMimeTypes.find((mT) => mT === file.mimetype);

    if (file && !mimeType) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      return res.json({ message: "Only images allowed!" });
    }
  });

  try {
    const project = await projectService.getProjectByExternalId(project_id);
    if (!project)
      return res
        .status(404)
        .json({ message: `Project with ${project_id} not found` });
    const addendum = project.extraPositions?.find((extraOrder) => extraOrder.id === order_id )
    if (!addendum)
      return res
        .status(404)
        .json({ message: `Addendum with ${order_id} not found` });
    const existingImage = addendum.fileURL ?? [];
    for (const file of files) {
      const {
        uploadParams: { Body },
        extension,
        key,
      } = storage.boostrapFile(file);
      const response = await storage.uploadFile(
        process.env.BUCKET_NAME,
        Body,
        `/project/${project._id.toString()}/addendum/${extension}.${key}`
      );
      existingImage.push(response.publicUrl);
    }
    console.log("existingImage", existingImage)
    const response = await projectService.updateExtraOrder({
      order_id,
      fileURL: existingImage,
      project_id
    });
    return res.json(response);
  } catch (error) {
    return res.json({ message: error.message });
  }
};

type DocumentUploadParamMap = {
  document: (typeof userDocumentsArray)[number];
  _id: string;
};

export const uploadDocument = async (req: Request, res: Response) => {
  const { _id, document } = req.params as DocumentUploadParamMap;

  const mimeTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/svg",
    "application/pdf",
  ];

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
    const userDocuments = user.documents ?? ([] as Document[]);
    const _document = {
      name: document,
      fileUrl: response.publicUrl,
      uploadedAt: new Date().getTime().toString(),
      status: "UPLOADED",
    };
    userDocuments[`${document}`] = response.publicUrl;
    const filteredDocuments = userDocuments.filter(
      (doc) => doc.name !== document
    );
    await userService.updateProfile({
      documents: [_document, ...filteredDocuments],
      _id: user._id,
    });
    user.documents = userDocuments;
    await notificationService.create(
      `Your document ${document} has been updated succesfully!`,
      "Profile-Update",
      user._id.toString()
    );
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
    await notificationService.create(
      "Your logo has been updated succesfully!",
      "Profile-Update",
      user._id.toString()
    );
    return res.json(user);
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const uploadProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const imageMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

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
    await storage.uploadProject(id, Body, "projects", extension);
    const response = await projectService.parsePDF(Body, id);
    return res.json(response);
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const uploadProjectPositionFile = async (
  req: Request,
  res: Response
) => {
  const { id, trade, position } = req.params;

  try {
    const {
      extension,
      key,
      uploadParams: { Body },
    } = storage.boostrapFile(req.file);

    const response = await storage.uploadFile(
      process.env.BUCKET_NAME,
      Body,
      `/project/${id}/${trade}/${position}/${key}.${extension}`
    );
    return res.json(response);
  } catch (error) {
    return res.json({ message: error.message });
  }
};


export const getAllEmployeesFolder = async (req: Request, res: Response) => {
  const { role } = req.params;
  try {
    const users = await storage.getUsersFolders(role);
    return res.json(users);
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  const { prefix } = req.body;
  console.log(req.body);
  try {
    const files = await storage.listAllFiles(process.env.BUCKET_NAME, prefix);
    return res.json(files);
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const getEmployeesFolder = async (req: Request, res: Response) => {
  const { owner_id } = req.params;
  try {
    const employeesFolder = await storage.getEmployeesFolder(owner_id);
    return res.json(employeesFolder);
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const getExecutorsFolder = async (req: Request, res: Response) => {
  const { owner_id } = req.params;
  try {
    const executorsFolder = await storage.getExecutorsFolders(owner_id);
    return res.json(executorsFolder);
  } catch (error) {
    return res.json({ message: error.message });
  }
};
