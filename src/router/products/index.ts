import { Router } from "express";
import { PRODUCT_ROUTES } from "../routes";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getStoreProducts,
  uploadMultipleProducts,
  updateProduct
} from "../../controllers/product";
import multer from 'multer';


const upload = multer({ storage: multer.memoryStorage() })

const router = Router();

router.post(PRODUCT_ROUTES.CREATE, createProduct);
router.get(PRODUCT_ROUTES.PRODUCT, getProductById);
router.get(PRODUCT_ROUTES.SHOP_PRODUCTS, getStoreProducts);
router.delete(PRODUCT_ROUTES.PRODUCT, deleteProduct);
router.post(PRODUCT_ROUTES.SHOP_PRODUCTS, upload.array('products'), uploadMultipleProducts);
router.patch(PRODUCT_ROUTES.PRODUCT, updateProduct);

export default router;
