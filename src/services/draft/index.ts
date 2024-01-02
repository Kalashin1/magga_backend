import { ObjectId } from "mongodb";
import { AppDataSource } from "../../data-source";
import { Draft } from "../../entity/draft";
import projectService, { ProjectService } from "../project";
import notificationService, { NotificationService } from "../notifications";
import { TradeSchedule, DRAFT_STATUS, ProjectPositions, TASK_STATUS } from "../../types";
import userService, { UserService } from "../user";
import todoService, { TodoService } from "../todo"

export class DraftSerVice {
  constructor(
    private projectService: ProjectService,
    private notificationService: NotificationService,
    private userService: UserService,
    private todoService: TodoService
  ){}
  async create(draft: Partial<Draft>) {
    const project = await this.projectService.getProjectById(draft.project);
    if (!project) throw Error("Project not found!");
    const user = await this.userService.getUser({ _id: draft.user_id });
    if (!user) throw Error("User was not found");
    const reciepient = await this.userService.getUser({ _id: draft.reciepient });
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
    await this.notificationService.create(
      "Draft has been created successfully! " + savedDraft._id.toString(),
      "DRAFT",
      user._id.toString(),
      savedDraft._id.toString()
    );
    await this.notificationService.create(
      "Draft has been sent to you " + savedDraft._id.toString(),
      "DRAFT",
      reciepient._id.toString(),
      savedDraft._id.toString()
    );
    await this.todoService.create({
      type: "DRAFT",
      description: `You have a new draft to attend to ${draft._id}`,
      status: TASK_STATUS[0],
      user_id: user._id.toString(),
      object_id: savedDraft._id.toString(),
      assignedTo: project.contractor,
    });
    return savedDraft;
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
    const project = await this.projectService.getProjectById(draft.project);
    const owner = await this.userService.getUser({ _id: draft.user_id });
    const reciepient = await this.userService.getUser({
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
      await this.projectService.updateMultiplePositionByTrade(
        draft.project,
        trades,
        "COMPLETED"
      );
      return await AppDataSource.mongoManager.deleteOne(Draft, draft);
    }
    if (DRAFT_STATUS[status] === DRAFT_STATUS[2]) {
      await this.todoService.create({
        type: "DRAFT",
        description: `You have a new draft to attend to ${draft._id}`,
        status: TASK_STATUS[0],
        user_id: draft.reciepient,
        object_id: draft._id.toString(),
        assignedTo: draft.user_id,
      });
    }
    draft.status = DRAFT_STATUS[status];
    draft.timeline = timeline;
    const message = `Status of the draft has been changed draft is now ${DRAFT_STATUS[status]} ${draft_id}`;
    await this.notificationService.create(message, "DRAFT", draft.user_id);
    await this.notificationService.create(message, "DRAFT", draft.reciepient);
    return await this.save(draft);
  }

  save(draft: Draft) {
    return AppDataSource.mongoManager.save(Draft, draft);
  }
}

export default new DraftSerVice(
  projectService,
  notificationService,
  userService,
  todoService
);
