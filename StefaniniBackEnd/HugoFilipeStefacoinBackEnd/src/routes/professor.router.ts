import { TipoUsuario } from './../utils/tipo-usuario.enum';
import express, { NextFunction, Request, Response } from 'express';
import ProfessorController from '../controllers/professor.controller';
import Professor from '../entities/professor.entity';
import Mensagem from '../utils/mensagem';
import { TokenUtils } from '../utils/utils';
import ProfessorCurso from '../models/professor-curso.model';

const router = express.Router();


router.put('/professor/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decoded = TokenUtils.getToken(req)

    const { id } = req.params;
    const mensagem: Mensagem = await new ProfessorController().alterar(Number(id), req.body, decoded);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});
// router.put('/professor/lecionarCurso/:idCurso', async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const decoded = TokenUtils.getToken(req)

//     const { idCurso } = req.params;
//     const mensagem: Mensagem = await new ProfessorController().lecionarCurso(Number(idCurso), decoded);
//     res.json(mensagem);
//   } catch (e) {
//     next(e);
//   }
// });

router.delete('/professor/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decoded = TokenUtils.getToken(req)

    const { id } = req.params;
    const mensagem: Mensagem = await new ProfessorController().excluir(Number(id), decoded);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.get('/professor/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const professor: ProfessorCurso = await new ProfessorController().obterPorId(Number(id));
    res.json(professor);
  } catch (e) {
    next(e);
  }
});

router.get('/professor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const professores: Professor[] = await new ProfessorController().listar();
    res.json(professores);
  } catch (e) {
    next(e);
  }
});

export default router;
