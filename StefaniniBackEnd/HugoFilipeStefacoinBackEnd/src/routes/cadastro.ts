import express, { NextFunction, Request, Response } from 'express';
import ProfessorController from '../controllers/professor.controller';
import Mensagem from '../utils/mensagem';
import AlunoController from '../controllers/aluno.controller';
import CursoController from '../controllers/curso.controller';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';
import { TipoUsuario } from '../utils/tipo-usuario.enum';
import { TokenUtils } from '../utils/utils';

const router = express.Router();


router.post('/aluno', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mensagem: Mensagem = await new AlunoController().incluir(req.body);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.post('/professor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const mensagem: Mensagem = await new ProfessorController().incluir(req.body);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});


export default router;
