import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

//Reescribir la interfaz del Request para poder mandar la info del usuario y poder acceder a esta en otro middleware.
declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization;
    if(!bearer) {
        const error = new Error('No autorizado');
        return res.status(401).json({error: error.message});
    }
    //Con un array destructuring se separan los headers para solo obtener el jwt y no la palabra bearer.
    const [, token] = bearer.split(' ');
    try {
        //Revisa que sea un JWT válido(que no haya expirado y que la firma sea la misma).
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Esta validación solo es necesaria cuando se utiliza Node con TypeScript.
        if(typeof decoded === 'object' && decoded.id) {
            //Una vez que se valida el jwt se valida que el usuario exista en la DB
            const user = await User.findById(decoded.id).select('_id name email'); //Solo obtiene esta info del usuario.
            if(user) {
                req.user = user; //En el request se envía la info del usuario.
                next();
            } else {
                res.status(500).json({error: 'Token no válido'});
            }
        }
    } catch (error) {
        res.status(500).json({error: 'Token no válido'});
    }
}