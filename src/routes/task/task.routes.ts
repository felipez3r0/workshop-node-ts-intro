import { Router } from 'express'
import TaskController from '../../controllers/task/task.controller'

const taskRoutes = Router()

taskRoutes.post('/', TaskController.store)
taskRoutes.get('/', TaskController.index)
taskRoutes.get('/:id', TaskController.show)

export default taskRoutes