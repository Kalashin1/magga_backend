import { AppDataSource } from "../../data-source";
import { Message } from "../../entity/message";

export class MessageService {

  async create(payload: Message) {
    return this.save(
      AppDataSource.mongoManager.create(Message, payload)
    );
  }

  async getProjectMessages(project_id: string) {
    return await AppDataSource.mongoManager.find(Message, {
      where: {
        project_id: {
          $eq: project_id,
        },
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  save(message: Message) {
    return AppDataSource.mongoManager.save(Message, message);
  }
}
