import { Router } from "express";
import { POSITION_ROUTES } from "../routes";
import { getPostionByTrade, getPosition, uploadPosition, deletePositions } from "../../controllers/positions";
import multer from 'multer';


const upload = multer({ storage: multer.memoryStorage() })

const router = Router();

router.get(POSITION_ROUTES.POSITION_BY_TRADE, getPostionByTrade);
router.get(POSITION_ROUTES.POSITION_BY_ID, getPosition);
router.post(POSITION_ROUTES.POSITION_BY_FILES, upload.single('position'), uploadPosition);
router.delete(POSITION_ROUTES.DELETE_POSTION, deletePositions);

export default router;