import { Router } from "express";
import { 
  showAllBuckets, 
  uploadProfilePhoto, 
  uploadDocument,
  uploadLogo,
  getAllEmployeesFolder,
  getFiles,
  getEmployeesFolder,
  getExecutorsFolder,
  uploadProject,
  uploadProjectPositionFile,
  uploadProductImages,
  uploadAddendumFile
} from "../controllers/storage";
import { BUCKET_ROUTES } from "./routes";
import { getTestingForm } from "../controllers/storage/getTestingForm";
import multer from 'multer';


const upload = multer({ storage: multer.memoryStorage() })

const router = Router();

router.get(BUCKET_ROUTES.OWNER_EMPLOYEE, getEmployeesFolder)

router.get(BUCKET_ROUTES.OWNER_EXECUTORS, getExecutorsFolder)

router.get(BUCKET_ROUTES.BUCKETS, showAllBuckets);

router.get(BUCKET_ROUTES.TEST_UPLOAD, getTestingForm);

router.post(BUCKET_ROUTES.PROFILE_PHOTO, upload.single('image'), uploadProfilePhoto);

router.post(BUCKET_ROUTES.DOCUMENT, upload.single('document'), uploadDocument);

router.post(BUCKET_ROUTES.LOGO_URL, upload.single('logo'), uploadLogo);

router.get(BUCKET_ROUTES.EMPLOYEES_FOLDER, getAllEmployeesFolder);

router.patch(BUCKET_ROUTES.GET_FILE, getFiles);

router.post(BUCKET_ROUTES.UPLOAD_PROJECT, upload.single('project'), uploadProject);

router.post(BUCKET_ROUTES.UPLOAD_POSITION_DOCUMENT, upload.single('position-document'), uploadProjectPositionFile)

router.patch(BUCKET_ROUTES.UPLOAD_PRODUCT_IMAGE, upload.array('product'), uploadProductImages)

router.patch(BUCKET_ROUTES.UPLOAD_ADDENDUM_IMAGE, upload.array('extraOrder'), uploadAddendumFile)

export default router;