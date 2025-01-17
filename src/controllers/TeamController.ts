import { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({email}).select('_id email name');
            if(!user) {
                const error = new Error('Usuario no encontrado');
                return res.status(404).json({ error: error.message });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    }

    static addMemberById = async (req: Request, res: Response) => {
        try {
            const { id } = req.body;
            const user = await User.findById(id).select('id');
            if(!user) {
                const error = new Error('Usuario no encontrado');
                return res.status(404).json({ error: error.message });
            }

            //Si el usuario es parte del equipo lanza una alerta.
            if(req.project.team.some(team => team.toString() === user.id.toString())) {
                const error = new Error('El usuario ya es colaborador del proyecto');
                return res.status(409).json({error: error.message});
            }

            //Se agrega el usuario al equipo.
            req.project.team.push(user.id);
            await req.project.save();
            res.send('Colaborador agregado corrrectamente');
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    }
    
    static getProjectTeam = async (req: Request, res: Response) => {
        try {
            const project = await Project.findById(req.project.id).populate({
                path: 'team',
                select: 'id email name'
            });
            res.json(project.team);
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    }

    static removeMemberById = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            //Si el usuario no es parte del equipo lanza un error.
            if(!req.project.team.some(team => team.toString() === userId)) {
                const error = new Error('El usuario no es colaborador del proyecto');
                return res.status(409).json({error: error.message});
            }
            //Eliminar usuario del proyecto
            req.project.team = req.project.team.filter(teamMember => teamMember.toString() !== userId);
            await req.project.save();
            res.send('Se ha eliminado al colaborador del proyecto');
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    }
}