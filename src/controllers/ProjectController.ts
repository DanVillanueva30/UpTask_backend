import type  { Request, Response } from "express";
import Project from "../models/Project";

//Originalmente se realizaban comprobaciones en updateProject y deleteProject para detectar si el proyecto al cual se quería realizar algún tipo de cambio existe y segundo si el usuario tiene permiso, comparando el usuario con sesión activa con el manager del proyecto. Ambas comprobaciones se realizaban en los dos métodos. Estos son eliminados utilizando en su lugar dos middleware que ya existen, uno verifica que el proyecto exista y el otro si el usuario tiene permiso permitiendo hacer más corto el controlador.

export class ProjectController {

    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body);

        //Asignar un manager a cada proyecto creado.
        project.manager = req.user.id;

        try {
            await project.save();
            res.send('Proyecto creado correctamente');
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'});
        }
    }

    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [ //Obtener solo los proyectos que el usuario haya creado.
                    {manager: {$in: req.user.id}},
                    {team: {$in: req.user.id}} //Si eres parte del proyecto si lo puedes ver.
                ]
            });
            res.json(projects);
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'});
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            //Obtiene el proyecto y también toda la información de sus tareas.
            const project = await Project.findById(id).populate('tasks');
            if(!project) {
                const error = new Error('Proyecto no encontrado');
                return res.status(404).json({error: error.message});
            }

            //Validar que el usuario y el manager del proyecto sean el mismo para poder ver la tarea, o si no eres parte del equipo no tienes acceso al proyecto
            if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
                const error = new Error('Acción no válida');
                return res.status(403).json({error: error.message});
            }
            res.json(project);
        } catch (error) {
            res.status(500).json({error: 'Proyecto no encontrado'});
        }
    }

    static updateProject = async (req: Request, res: Response) => {
        // const { id } = req.params;
        try {
            // const project = await Project.findById(id);
            // if(!project) {
            //     const error = new Error('Proyecto no encontrado');
            //     return res.status(404).json({error: error.message});
            // }

            // //Validar que el usuario y el manager del proyecto sean el mismo para poder actualizar la tarea.
            // if(project.manager.toString() !== req.user.id.toString()) {
            //     const error = new Error('Solo el Manager puede actualizar un proyecto');
            //     return res.status(403).json({error: error.message});
            // }
            req.project.clientName = req.body.clientName;
            req.project.projectName = req.body.projectName;
            req.project.description = req.body.description;
            await req.project.save();
            res.json('Proyecto actualizado');
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'});
        }
    }

    static deleteProject = async (req: Request, res: Response) => {   
        // const { id } = req.params;

        try {
            // const project = await Project.findById(id);
            // if(!project) {
            //     const error = new Error('Proyecto no encontrado');
            //     return res.status(404).json({error: error.message});
            // }

            // //Validar que el usuario y el manager del proyecto sean el mismo para poder eliminar la tarea.
            // if(project.manager.toString() !== req.user.id.toString()) {
            //     const error = new Error('Solo el Manager puede eliminar la tarea');
            //     return res.status(403).json({error: error.message});
            // }

            await req.project.deleteOne();
            res.json('Proyecto eliminado');

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'});
        }
    }
}