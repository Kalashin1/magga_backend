import { Router } from "express";
import { PRODUCT_ROUTES } from "../routes";
import { createProduct, deleteProduct, getProductById, getStoreProducts } from "../../controllers/product";

const router = Router()

router.post(PRODUCT_ROUTES.CREATE, createProduct);
router.get(PRODUCT_ROUTES.PRODUCT, getProductById);
router.get(PRODUCT_ROUTES.SHOP_PRODUCTS, getStoreProducts);
router.delete(PRODUCT_ROUTES.PRODUCT, deleteProduct);

export default router;