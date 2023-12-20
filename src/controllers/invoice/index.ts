import { Request, Response } from "express";
import { InvoiceService } from "../../services/invoice";
import userService from "../../services/user";
import draftService from "../../services/draft";
import projectService from "../../services/project";

export const createInvoice = async (req: Request, res: Response) => {
  const { payload } = req.body;
  try {
    const invoice = await new InvoiceService().create(payload);
    const owner = await userService.getUser({ _id: invoice.owner });
    const receiver = await userService.getUser({ _id: invoice.receiver });
    const draft = await draftService.getDraft(invoice.draft);
    const draftProject = await projectService.getProjectById(draft.project);
    const data = {
      ...invoice,
      owner,
      receiver,
      draft: { ...draft, project: draftProject },
    };
    return res.json(data);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getOwnerInvoice = async (req: Request, res: Response) => {
  const { owner_id, status } = req.params;
  try {
    const invoices = await new InvoiceService().getOwnerInvoices(
      owner_id,
      status
    );
    const payload = await Promise.all(
      invoices.map(async (invoice) => {
        const owner = await userService.getUser({ _id: invoice.owner });
        const receiver = await userService.getUser({ _id: invoice.receiver });
        const draft = await draftService.getDraft(invoice.draft);
        const draftProject = await projectService.getProjectById(
          draft?.project
        );
        return {
          ...invoice,
          owner,
          receiver,
          draft: { ...draft, project: draftProject },
        };
      })
    );
    return res.json(payload);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

export const getRecieverInvoice = async (req: Request, res: Response) => {
  const { user_id, status } = req.params;
  try {
    const invoices = await new InvoiceService().getRecieverInvoices(
      user_id,
      status
    );
    const payload = await Promise.all(
      invoices.map(async (invoice) => {
        const owner = await userService.getUser({ _id: invoice.owner });
        const receiver = await userService.getUser({ _id: invoice.receiver });
        const draft = await draftService.getDraft(invoice.draft);
        const draftProject = await projectService.getProjectById(draft.project);
        return {
          ...invoice,
          owner,
          receiver,
          draft: { ...draft, project: draftProject },
        };
      })
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const invoice = await new InvoiceService().getInvoiceById(id);
    const owner = await userService.getUser({ _id: invoice.owner });
    const receiver = await userService.getUser({ _id: invoice.receiver });
    const draft = await draftService.getDraft(invoice.draft);
    const draftProject = await projectService.getProjectById(draft.project);
    const payload = {
      ...invoice,
      owner,
      receiver,
      draft: { ...draft, project: draftProject },
    };
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getInvoiceByExternalId = async (req: Request, res: Response) => {
  const { external_id } = req.params;
  try {
    const invoice = await new InvoiceService().getInvoiceByExternalId(
      external_id
    );
    const owner = await userService.getUser({ _id: invoice.owner });
    const receiver = await userService.getUser({ _id: invoice.receiver });
    const draft = await draftService.getDraft(invoice.draft);
    const draftProject = await projectService.getProjectById(draft.project);
    const payload = {
      ...invoice,
      owner,
      receiver,
      draft: { ...draft, project: draftProject },
    };
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
