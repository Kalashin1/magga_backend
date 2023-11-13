import { AppDataSource } from "../../data-source";
import { Message } from "../../entity/message";
import notificationService from "../notifications";
import projectService from "../projects";
import userService from "../user";

export class MessageService {
  async create(payload: Message) {
    const owner = await userService.getUser({ _id: payload.owner_id });
    const receiver = await userService.getUser({ _id: payload.reciever_id });
    const project = await projectService.getProjectById(payload.reciever_id);
    if (!owner) throw Error("Message owner not found");

    if (!receiver) throw Error("Reciever owner not found");

    if (!project) throw Error("Project owner not found");

    const message = await AppDataSource.mongoManager.create(Message, payload);
    const savedMessage = await this.save(message);

    await notificationService.create(
      `New message from ${owner.first_name}`,
      "MESSAGE",
      receiver._id.toString(),
      savedMessage._id.toString()
    );
    
    await notificationService.create(
      `Message sent to ${owner.first_name}`,
      "MESSAGE",
      owner._id.toString(),
      savedMessage._id.toString()
    );
    return savedMessage;
  }

  async getProjectMessages(project_id: string) {
    const project = await projectService.getProjectById(project_id);
    if (!project) throw Error('Project not found');
    return await AppDataSource.mongoManager.find(Message, {
      where: {
        project_id: {
          $eq: project_id
        }
      },
      order: {
        createdAt: 'DESC'
      }
    })
  }

  save(message: Message) {
    return AppDataSource.mongoManager.save(Message, message);
  }
}
