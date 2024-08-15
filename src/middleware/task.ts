import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

//Reescribe el scope global
declare global { 
    namespace Express {
        interface Request { // <-- Se reescribe Request para poder agregar el proyecto
            task: ITask;
        }
    }
}

export async function taskExists(req: Request, res: Response, next: NextFunction) {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);
        if(!task) {
            const error = new Error('Tarea no encontrada');
            return res.status(404).json({error: error.message});
        }
        req.task = task; // <-- si es proyecto existe se manda en el request.
        next();
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'});
    }
}

export async function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
    //Si el id del proyecto(url) y el Id que tiene como referencia una tarea no son iguales significa que esa tarea pertenece a un proyecto diferente, por lo tanto no se permite verla.
    if(req.task.project.toString() !== req.project.id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(400).json({error: error.message});
    }
    next();
}

export async function hasAuthorization(req: Request, res: Response, next: NextFunction) {
    if(req.user.id.toString() !== req.project.manager.toString()) { 
        const error = new Error('Acción no válida');
        return res.status(400).json({error: error.message});
    }
    next();
}