import { ObjectId } from "mongodb";
import { AppDataSource } from "../../data-source";
import { Draft } from "../../entity/draft";
import projectService, { ProjectService } from "../project";
import { NotificationService } from "../notifications";
import { TradeSchedule, DRAFT_STATUS, ProjectPositions } from "../../types";
const notificationService = new NotificationService();
import UserService from "../user";

export class DraftSerVice {
  async create(draft: Partial<Draft>) {
    const project = await projectService.getProjectById(draft.project);
    if (!project) throw Error("Project not found!");
    const user = await UserService.getUser({ _id: draft.user_id });
    if (!user) throw Error("User was not found");
    const reciepient = await UserService.getUser({ _id: draft.reciepient });
    if (!reciepient) throw Error("Receipient was not found");
    const keys = Object.keys(draft.positions);
    const timeline = project.sheduleByTrade.find(
      (schedule) => schedule.name === keys[0]
    );
    const newDraft = AppDataSource.mongoManager.create(Draft, {
      ...draft,
      timeline: {
        startDate: timeline?.startDate ?? new Date().toDateString(),
        endDate: draft.timeline?.endDate ?? new Date().toDateString(),
      },
      status: DRAFT_STATUS[0],
    }) as Draft;
    const savedDraft = await this.save(newDraft);
    await notificationService.create(
      "Draft has been created successfully! " + savedDraft._id.toString(),
      "DRAFT",
      user._id.toString(),
      savedDraft._id.toString()
    );
    await notificationService.create(
      "Draft has been sent to you " + savedDraft._id.toString(),
      "DRAFT",
      reciepient._id.toString(),
      savedDraft._id.toString()
    );
    return await this.save(newDraft);
  }

  async getDraft(id: string) {
    return await AppDataSource.mongoManager.findOne(Draft, {
      where: {
        _id: {
          $eq: new ObjectId(id),
        },
      },
    });
  }

  async getDraftById(id: string) {
    const draft = await this.getDraft(id);
    const project = await new ProjectService().getProjectById(draft.project);
    const owner = await UserService.getUser({ _id: draft.user_id });
    const reciepient = await UserService.getUser({
      _id: draft.reciepient,
    });
    const projectPositions: ProjectPositions[] = [];
    for (const key in project.positions) {
      projectPositions.push(...project.positions[key].positions);
    }
    const positions = [];
    console.log(draft.positions);
    for (const key of Object.keys(draft.positions)) {
      console.log(key);
      for (const draftPosition of draft.positions[key]) {
        for (const position of projectPositions) {
          if (draftPosition.external_id === position.external_id) {
            position.tradeName = key;
            position.executor = project.positions[key].executor
            positions.push(position);
          }
        }
      }
    }
    const addendums = [];
    for (const draft_addendum_id in draft.addendums) {
      for (const addendum of project.extraPositions) {
        if (draft_addendum_id === addendum.id) {
          const positions = [];
          for (const trade in addendum.positions) {
            addendum.positions[trade].positions.forEach((position) => {
              position.executor =
                addendum.acceptedBy.role === "executor"
                  ? addendum.acceptedBy._id
                  : addendum.createdBy._id;
            });
            positions.push(...addendum.positions[trade].positions);
          }
          addendums.push({
            id: draft_addendum_id,
            positions,
            comment: addendum.comment,
            createdBy: addendum.createdBy,
            createdAt: addendum.createdAt,
          });
        }
      }
    }
    return { ...draft, owner, reciepient, project, positions, addendums };
  }

  async getUserDrafts(user_id: string) {
    return await AppDataSource.mongoManager.find(Draft, {
      where: {
        user_id: {
          $eq: user_id,
        },
      },
      order: {
        createdAt: "DESC",
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
      order: {
        createdAt: "DESC",
      },
    });
  }

  async updateDraftStatus(
    draft_id: string,
    status: number,
    timeline?: Required<Exclude<TradeSchedule, "name">>
  ) {
    const draft = await this.getDraft(draft_id);
    if (status === -1) {
      const trades = Object.keys(draft.positions);
      await projectService.updateMultiplePositionByTrade(
        draft.project,
        trades,
        "COMPLETED"
      );
      return await AppDataSource.mongoManager.deleteOne(Draft, draft);
    }
    draft.status = DRAFT_STATUS[status];
    draft.timeline = timeline;
    const message = `Status of the draft has been changed draft is now ${DRAFT_STATUS[status]} ${draft_id}`;
    await notificationService.create(message, "DRAFT", draft.user_id);
    await notificationService.create(message, "DRAFT", draft.reciepient);
    return await this.save(draft);
  }

  save(draft: Draft) {
    return AppDataSource.mongoManager.save(Draft, draft);
  }
}

const draftService = new DraftSerVice();

export default draftService;
