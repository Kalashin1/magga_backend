import { Router } from "express";
import { POSITION_ROUTES } from "../routes";
import { getPostionByTrade, getPosition } from "../../controllers/positions";

const router = Router();

router.get(POSITION_ROUTES.POSITION_BY_TRADE, getPostionByTrade);
router.get(POSITION_ROUTES.POSITION_BY_ID, getPosition);

export default router;