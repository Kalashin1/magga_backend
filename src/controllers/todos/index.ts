import TodoService from '../../services/todo';
import { Request, Response } from 'express';

export const createTodo = async (req: Request, res: Response) => {
  const {paylaod} = req.body;

  try {
    const todo = await TodoService.create(paylaod);
    return res.json(todo)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const getTodoById = async (req: Request, res: Response) => {
  const {id} = req.params;

  try {
    const todo = await TodoService.getTodoById(id);
    return res.json(todo)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const getUserTodos = async (req: Request, res: Response) => {
  const {user_id, status} = req.params;
  try {
    if (status) {
      const todo = await TodoService.getUserTodosByStatus(user_id, status);
      return res.json(todo)
    } else {
      const todo = await TodoService.getUserTodos(user_id)
      return res.json(todo)
    }
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const getAssignedTodos = async (req: Request, res: Response) => {
  const {user_id, status} = req.params;
  try {
    if (status) {
      const todo = await TodoService.getAssignedTodosByStatus(user_id, status);
      return res.json(todo)
    } else {
      const todo = await TodoService.getAssignedTodos(user_id)
      return res.json(todo)
    }
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const updateTodo = async (req: Request, res: Response) => {
  const {paylaod} = req.body;
  const {id} = req.params;
  try {
    const todo = await TodoService.updateTodo(id, paylaod);
    return res.json(todo)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}
