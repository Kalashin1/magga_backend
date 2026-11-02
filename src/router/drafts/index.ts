import { Router } from "express";
import { DRAFT_ROUTES } from "../routes";
import { createDraft, getDraftById, getReceipientDrafts, getUserDrafts, updateDraftStatus } from "../../controllers/drafts";

const router = Router();

router.post(DRAFT_ROUTES.CREATE, createDraft);
router.get(DRAFT_ROUTES.DRAFT, getDraftById);
router.get(DRAFT_ROUTES.USER_DRAFT, getUserDrafts);
router.patch(DRAFT_ROUTES.USER_DRAFT, getReceipientDrafts);
router.patch(DRAFT_ROUTES.UPDATE_DRAFT, updateDraftStatus);

export default router;