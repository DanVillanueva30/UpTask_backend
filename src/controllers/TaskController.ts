import type { Request, Response } from "express";
import Task from "../models/Task";

export class TaskController {
    static createTask = async (req: Request, res: Response) => {
        try {
            const task = new Task(req.body);
            task.project = req.project.id; //En task se agrega el ID del proyecto al que pertenece la tarea.
            req.project.tasks.push(task.id); // En el Proyecto se agrega el ID de la tarea creada.
            await Promise.allSettled([task.save(), req.project.save()]);
            res.send('Tarea creada correctamente');
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'});
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {
             const tasks = await Task.find({project: req.project.id}).populate('project'); // <-- Obtener la info del proyecto al que pertenece
             res.json(tasks);
        } catch (error) {
            res.status(404).json({error: 'Tarea no encontrada'});
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.task.id)
                            .populate({path: 'completedBy.user', select: '_id name email'})
                            .populate({path: 'notes', populate: {path: 'createdBy', select: '_id name email' }})
            res.json(task);
        } catch (error) {
            res.status(404).json({error: 'Tarea no encontrada'});
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            req.task.name = req.body.name;
            req.task.description = req.body.description;
            await req.task.save();

            res.send('Tarea actualizada');
        } catch (error) {
            res.status(404).json({error: 'Tarea no encontrada'});
        }
    }

    static deleteTask = async (req: Request, res: Response) => {
        try {
            //Elimina el ID de la Tarea a eliminar en la tabla de Projects
            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id.toString());
            //Elimina la tarea de la tabla Tasks y también actualiza Projects solo con las tareas no eliminadas.
            await Promise.allSettled([ req.task.deleteOne(), req.project.save()]);

            res.send('Tarea eliminada');
        } catch (error) {
            res.status(404).json({error: 'Tarea no encontrada'});
        }
    }

    static updateStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body;
            req.task.status = status;

            const data = { //Este obj almacena el usuario que hizo el cambio y el estdo de la tarea.
                user: req.user.id,
                status
            }
            req.task.completedBy.push(data);
            await req.task.save();
            res.send('Tarea actualizada');

        } catch (error) {
            res.status(404).json({error: 'Tarea no encontrada'});
        }
    }

}