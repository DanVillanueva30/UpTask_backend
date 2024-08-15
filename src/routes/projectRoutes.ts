import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validator";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExists } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";


const router = Router();
router.use(authenticate);

router.post('/',
    body('projectName')    
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción del proyecto es obligatoria'),
    handleInputErrors,
    ProjectController.createProject
);
router.get('/', ProjectController.getAllProjects);
router.get('/:id',
    param('id')
        .isMongoId().withMessage('Id no válido'),
    handleInputErrors,    
    ProjectController.getProjectById
);

//Para todas las rutas que tengan ese parámetro se va a ejecutar la función que valida que el proyecto exista, esto previene estar repitiendo esa misma línea de código en cada nueva ruta.
router.param('projectId', projectExists);

router.put('/:projectId',
    param('projectId')
        .isMongoId().withMessage('Id no válido'),
    body('projectName')    
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción del proyecto es obligatoria'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.updateProject
);

router.delete('/:projectId',
    param('projectId')
        .isMongoId().withMessage('Id no válido'),
    handleInputErrors,    
    hasAuthorization,
    ProjectController.deleteProject
);

//Routes for Tasks


router.post('/:projectId/tasks',
    hasAuthorization,
    body('name')
        .notEmpty().withMessage('El nombre de la tarea no puede ir vacío'),
    body('description')
        .notEmpty().withMessage('La descripción de la tarea no puede ir vacía'),
    handleInputErrors,
    TaskController.createTask
);

router.get('/:projectId/tasks',
    TaskController.getProjectTasks
);

router.param('taskId', taskExists);
router.param('taskId', taskBelongsToProject);

router.get('/:projectId/tasks/:taskId',
    param('taskId')
        .isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TaskController.getTaskById
);

router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    body('name')
        .notEmpty().withMessage('El nombre de la tarea no puede ir vacío'),
    body('description')
        .notEmpty().withMessage('La descripción de la tarea no puede ir vacía'),
    handleInputErrors,
    TaskController.updateTask
);

router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId')
        .isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TaskController.deleteTask
);

router.post('/:projectId/tasks/:taskId/status',
    param('taskId')
        .isMongoId().withMessage('Id no válido'),
    body('status')
        .notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)

/** Routes for teams */
router.post('/:projectId/team/find',
    body('email')
        .isEmail().toLowerCase().withMessage('Email no válido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
);

router.post('/:projectId/team',
    body('id')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamMemberController.addMemberById
);

router.get('/:projectId/team',
    TeamMemberController.getProjectTeam
);

router.delete('/:projectId/team/:userId',
    param('userId')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamMemberController.removeMemberById
);

/**  Routes for Notes */
router.post('/:projectId/tasks/:taskId/notes',
    body('content')
        .notEmpty().withMessage('El contenido de la nota es obligatorio'),
    handleInputErrors,
    NoteController.createNote
);

router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
);

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    NoteController.deleteNote
);
export default router;