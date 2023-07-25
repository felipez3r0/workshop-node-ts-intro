import { Request, Response } from 'express'
import Task from '../../models/task.entity'

export default class TaskController {
  static async store (req: Request, res: Response) {
    const { title, completed } = req.body

    if (!title) {
      return res.status(400).json({ error: 'O título é obrigatório' })
    }

    const task = new Task()
    task.title = title
    task.completed = completed || false
    await task.save()

    return res.status(201).json(task)
  }

  static async index (req: Request, res: Response) {
    const tasks = await Task.find()
    return res.json(tasks)
  }

  static async show (req: Request, res: Response) {
    const { id } = req.params

    if(!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'O id é obrigatório' })
    }

    const task = await Task.findOneBy({id: Number(id)})
    return res.json(task)
  }
}