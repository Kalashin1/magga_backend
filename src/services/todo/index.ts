import { Todo } from "../../entity/todo";
import { AppDataSource } from "../../data-source";
import userService from "../user";
import notificationService from "../notifications";
import { ObjectId } from "mongodb";

class TodoService {
  async create(todo: Partial<Todo>) {
    const user = await userService.getUser({ _id: todo.user_id });
    if (!user) throw Error("user not found!");
    const createdTodo = AppDataSource.mongoManager.create(Todo, todo as Todo);
    const savedTodo = await this.save(createdTodo);
    await notificationService.create(
      "You have created a new Task",
      "TODO",
      user._id.toString(),
      savedTodo._id.toString()
    );
    await notificationService.create(
      "New Task generated for you",
      "TODO",
      todo.assignedTo,
      savedTodo._id.toString()
    );
    return savedTodo;
  }

  getUserTodos(user_id: string) {
    return AppDataSource.mongoManager.find(Todo, {
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

  getAssignedTodos(user_id: string) {
    return AppDataSource.mongoManager.find(Todo, {
      where: {
        assignedTo: {
          $eq: user_id,
        },
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  getTodoById(id: string) {
    return AppDataSource.mongoManager.findOne(Todo, {
      where: {
        _id: {
          $eq: new ObjectId(id),
        },
      },
    });
  }

  getUserTodosByStatus(user_id: string, status: string) {
    return AppDataSource.mongoManager.find(Todo, {
      where: {
        user_id: {
          $eq: user_id,
        },
        status: {
          $eq: status,
        },
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  getAssignedTodosByStatus(user_id: string, status: string) {
    return AppDataSource.mongoManager.find(Todo, {
      where: {
        assignedTo: {
          $eq: user_id,
        },
        status: {
          $eq: status,
        },
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  updateTodo(id: string, todo: Todo) {
    return AppDataSource.mongoManager.updateOne(
      Todo,
      {
        _id: {
          $eq: new ObjectId(id),
        },
      },
      todo
    );
  }

  save(todo: Todo) {
    return AppDataSource.mongoManager.save(todo);
  }
}

export default new TodoService();
