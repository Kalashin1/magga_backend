import { Router } from "express";
import { TODO_ROUTES } from "../routes";
import { getAssignedTodos, getTodoById, getUserTodos, updateTodo } from "../../controllers/todos";

const router = Router();

router.get(TODO_ROUTES.TODO, getTodoById);
router.get(TODO_ROUTES.USER_TODO, getUserTodos);
router.get(TODO_ROUTES.ASSIGNED_TODO, getAssignedTodos);
router.patch(TODO_ROUTES.TODO, updateTodo);

export default router;