import { jwt } from 'jsonwebtoken';
import express, { NextFunction, Request, Response } from 'express';
import AlunoController from '../controllers/aluno.controller';
import Aluno from '../entities/aluno.entity';
import Mensagem from '../utils/mensagem';
import config from '../utils/config/config'
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';
import { TokenUtils } from '../utils/utils';
import AlunoCurso from '../models/aluno-curso.model';

const router = express.Router();


router.put('/aluno/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decoded = TokenUtils.getToken(req)
    
    const { id } = req.params;
    const mensagem: Mensagem = await new AlunoController().alterar(Number(id), req.body, decoded);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.put('/aluno/matricular/:idCurso', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decoded = TokenUtils.getToken(req)

    const { idCurso } = req.params;
    const mensagem: Mensagem = await new AlunoController().matricular(Number(idCurso), decoded);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.delete('/aluno/:id', async (req: Request, res: Response, next: NextFunction) => {

  try {
    const decoded = TokenUtils.getToken(req)

    const { id } = req.params;
    const mensagem: Mensagem = await new AlunoController().excluir(Number(id), decoded);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.get('/aluno/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const aluno: AlunoCurso = await new AlunoController().obterPorId(Number(id));
    res.json(aluno);
  } catch (e) {
    next(e);
  }
});

router.get('/aluno', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alunos: AlunoCurso[] = await new AlunoController().listar();
    res.json(alunos);
  } catch (e) {
    next(e);
  }
});


export default router;
