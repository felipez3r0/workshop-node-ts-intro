import { Router } from 'express'
import TaskController from '../../controllers/task/task.controller'

const taskRoutes = Router()

taskRoutes.post('/', TaskController.store)

export default taskRoutes