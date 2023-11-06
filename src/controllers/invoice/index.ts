import { Request, Response } from "express";
import { InvoiceService } from "../../services/invoice";

export const createInvoice = async (req: Request, res: Response) => {
  const {payload} = req.body;
  try {
    const invoice = await new InvoiceService().create(payload);
    return res.json(invoice)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

export const getOwnerInvoice = async (req: Request, res: Response) => {
  const {owner_id, status} = req.params;
  try {
    const invoice = await new InvoiceService().getOwnerInvoices(owner_id, status);
    return res.json(invoice);
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

export const getRecieverInvoice = async (req: Request, res: Response) => {
  const {user_id, status} = req.params;
  try {
    const invoice = await new InvoiceService().getRecieverInvoices(user_id, status);
    return res.json(invoice);
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

export const getInvoiceById = async (req:Request, res: Response) => {
  const {id} = req.params;
  try {
    const invoice = await new InvoiceService().getInvoiceById(id);
    return res.json(invoice);
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

export const getInvoiceByExternalId = async (req:Request, res: Response) => {
  const {external_id} = req.params;
  try {
    const invoice = await new InvoiceService().getInvoiceByExternalId(external_id);
    return res.json(invoice);
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}