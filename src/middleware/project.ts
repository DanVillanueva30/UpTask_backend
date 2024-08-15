import type { Request, Response, NextFunction } from "express";
import Project, { IProject } from "../models/Project";

//Reescribe el scope global
declare global { 
    namespace Express {
        interface Request { // <-- Se reescribe Request para poder agregar el proyecto
            project: IProject;
        }
    }
}


export async function projectExists(req: Request, res: Response, next: NextFunction) {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if(!project) {
            const error = new Error('Proyecto no econtrado');
            return res.status(404).json({ error: error.message });
        }
        req.project = project; // <-- si es proyecto existe se manda en el request.
        next();
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'});
    }
}