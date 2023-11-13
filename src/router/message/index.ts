import { MESSAGE_ROUTES } from "../routes";
import { createMessage, getProjectMessage } from "../../controllers/message";
import { Router } from "express";

const router = Router();

router.post(MESSAGE_ROUTES.CREATE, createMessage);
router.get(MESSAGE_ROUTES.MESSAGE_BY_PROJECT_ID, getProjectMessage);

export default router;