import { ObjectId } from "mongodb";
import { AppDataSource } from "../../data-source";
import { Draft } from "../../entity/draft";
import projectService from "../project";
import userService from "../user";
import { NotificationService } from "../notifications";
import { INVOICE_STATUS } from "../../types";

const DRAFT_STATUS = ["ACCEPTED" , "REQUESTED", "DECLINED"] as const;
const notificationService = new NotificationService()

export class DraftSerVice {
  async create(draft: Partial<Draft>) {
    const project = await projectService.getProjectById(draft.project);
    if (!project) throw Error("Project not found!");
    const user = await userService.getUser({ _id: draft.user_id });
    if (!user) throw Error("User was not found");
    const reciepient = await userService.getUser({ _id: draft.reciepient });
    if (!reciepient) throw Error("Receipient was not found");
    const newDraft = AppDataSource.mongoManager.create(Draft, draft) as Draft;
    const savedDraft = await this.save(newDraft);
    await notificationService.create(
      'Draft has been created successfully! '+savedDraft._id.toString(),
      'DRAFT',
      user._id.toString(),
      savedDraft._id.toString()
    )
    await notificationService.create(
      'Draft has been sent to you '+savedDraft._id.toString(),
      'DRAFT',
      reciepient._id.toString(),
      savedDraft._id.toString()
    )
    return await this.save(newDraft);
  }

  async getDraftById(id: string) {
    return await AppDataSource.mongoManager.findOne(Draft, {
      where: {
        _id: {
          $eq: new ObjectId(id),
        },
      },
    });
  }

  async getUserDrafts(user_id: string) {
    return await AppDataSource.mongoManager.find(Draft, {
      where: {
        user_id: {
          $eq: user_id,
        },
      },
    });
  }

  async getReceipientDrafts(reciepient: string) {
    return await AppDataSource.mongoManager.find(Draft, {
      where: {
        reciepient: {
          $eq: reciepient,
        },
      },
    });
  }

  async updateDraftStatus(draft_id: string, status: number) {
    const draft = await this.getDraftById(draft_id);
    draft.status = INVOICE_STATUS[status];
    const message = `Status of the draft has been changed draft is now ${DRAFT_STATUS[status]} ${draft_id}`
    await notificationService.create(
      message,
      'DRAFT',
      draft.user_id
    )
    await notificationService.create(
      message,
      'DRAFT',
      draft.reciepient
    )
    return await this.save(draft);
  }

  save(draft: Draft) {
    return AppDataSource.mongoManager.save(Draft, draft);
  }
}


const draftService = new DraftSerVice();

export default draftService;