import { Request, Response } from "express";
import { DraftSerVice } from "../../services/draft";
import { ProjectService } from "../../services/projects";
import { UserService } from "../../services/user";
import { ProjectPositions } from "../../types";

export const createDraft = async (req: Request, res: Response) => {
  const { payload } = req.body;
  try {
    const data = await new DraftSerVice().create(payload);
    return res.json(data);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

export const getUserDrafts = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  try {
    const drafts = await new DraftSerVice().getUserDrafts(user_id);
    const payload = await Promise.all(
      drafts.map(async (draft) => {
        const project = await new ProjectService().getProjectById(
          draft.project
        );
        const owner = await new UserService().getUser({ _id: draft.user_id });
        const reciepient = await new UserService().getUser({
          _id: draft.reciepient,
        });
        return {
          ...draft,
          project,
          owner,
          reciepient,
        };
      })
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getReceipientDrafts = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  try {
    const payload = await new DraftSerVice().getReceipientDrafts(user_id);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getDraftById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {

    const draft = await new DraftSerVice().getDraftById(id);
    const project = await new ProjectService().getProjectById(
      draft.project
    );
    const owner = await new UserService().getUser({ _id: draft.user_id });
    const reciepient = await new UserService().getUser({
      _id: draft.reciepient,
    });
    const projectPositions: ProjectPositions[] = [];
    for (const key in project.positions) {
      projectPositions.push(...project.positions[key].positions)
    }
    const positions = [];
    for (const external_id of draft.positions) {
      for (const position of projectPositions) {
        if (position.external_id === external_id) {
          positions.push(position);
        }
      }
    }
    const payload = {...draft, owner, reciepient, project, positions}
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateDraftStatus = async (req: Request, res: Response) => {
  const { draft_id } = req.params;
  const { status } = req.body;
  try {
    const payload = await new DraftSerVice().updateDraftStatus(
      draft_id,
      status
    );
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
