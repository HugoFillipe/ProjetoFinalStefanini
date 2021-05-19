import express, { NextFunction, Request, Response } from 'express';
import CursoController from '../controllers/curso.controller';
import Curso from '../entities/curso.entity';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';
import Mensagem from '../utils/mensagem';
import { TipoUsuario } from '../utils/tipo-usuario.enum';
import { TokenUtils } from '../utils/utils';

const router = express.Router();

router.post('/curso', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decoded = TokenUtils.getToken(req)
    const mensagem: Mensagem = await new CursoController().incluir(req.body, decoded);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.post('/curso/avaliar/:idCurso/:nota', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idCurso, nota } = req.params;
    const decoded = TokenUtils.getToken(req)
    const mensagem: Mensagem = await new CursoController().avaliarCurso(Number(idCurso), decoded, Number(nota));
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.put('/curso/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decoded = TokenUtils.getToken(req)
    const { id } = req.params;
    const mensagem: Mensagem = await new CursoController().alterar(Number(id), req.body, decoded);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.delete('/curso/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decoded = TokenUtils.getToken(req)
    const { id } = req.params;
    const mensagem: Mensagem = await new CursoController().excluir(Number(id), decoded);
    res.json(mensagem);
  } catch (e) {
    next(e);
  }
});

router.get('/curso/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const curso: Curso = await new CursoController().obterPorId(Number(id));
    res.json(curso);
  } catch (e) {
    next(e);
  }
});

router.get('/curso', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cursos: Curso[] = await new CursoController().listar();
    res.json(cursos);
  } catch (e) {
    next(e);
  }
});

export default router;
