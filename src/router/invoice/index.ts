import { Router } from "express";
import { INVOICE_ROUTES } from "../routes";
import { createInvoice, getInvoiceByExternalId, getInvoiceById, getOwnerInvoice, getRecieverInvoice } from "../../controllers/invoice";

const router = Router();

router.post(INVOICE_ROUTES.CREATE, createInvoice);
router.get(INVOICE_ROUTES.GET_RECIEVER_INVOICE, getRecieverInvoice);
router.get(INVOICE_ROUTES.GET_USER_INVOICE, getOwnerInvoice);
router.get(INVOICE_ROUTES.GET_INVOICE_BY_ID, getInvoiceById);
router.get(INVOICE_ROUTES.GET_INVOICE_BY_EXTERNAL_ID, getInvoiceByExternalId);


export default router;