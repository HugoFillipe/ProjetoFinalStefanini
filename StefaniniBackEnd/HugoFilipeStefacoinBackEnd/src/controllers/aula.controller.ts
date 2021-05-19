import Aula from '../models/aula.model';
import TokenUsuario from '../models/token.model';
import CursoRepository from '../repositories/curso.repository';
import BusinessException from '../utils/exceptions/business.exception';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';
import Mensagem from '../utils/mensagem';
import { TipoUsuario } from '../utils/tipo-usuario.enum';
import { Validador } from '../utils/utils';

export default class AulaController {
  async obterPorId(id: number, idCurso: number): Promise<Aula> {
    Validador.validarParametros([{ id }, { idCurso }]);
    const curso = await CursoRepository.obterPorId(idCurso);
    return curso.aulas.find((a) => a.id === id);
  }

  async listar(idCurso: number): Promise<Aula[]> {
    Validador.validarParametros([{ idCurso }]);
    const curso = await CursoRepository.obterPorId(idCurso);
    return curso.aulas;
  }

  async incluir(aula: Aula,decoded:TokenUsuario) {
    if(TipoUsuario.PROFESSOR === decoded.tipo){

    const { nome, duracao, topicos, idCurso } = aula;

    Validador.validarParametros([{ nome }, { duracao }, { topicos }, { idCurso }]);

    const curso = await CursoRepository.obterPorId(idCurso);

    if(curso.aulas.some(elementoAula => elementoAula.nome === nome)){
      throw new BusinessException("já existe aula com esse nome")
    }

    const idAnterior = curso.aulas[curso.aulas.length - 1]?.id;

    aula.id = idAnterior ? idAnterior + 1 : 1
    
    curso.aulas.push(aula);

    await CursoRepository.alterar({ id: idCurso }, curso);

    return new Mensagem('Aula incluido com sucesso!', {
      id: aula.id,
      idCurso,
    });
  }else{
    throw new UnauthorizedException("O usuario não é professor")
  }
  }

  async alterar(id: number, aula: Aula,decoded:TokenUsuario) {
    if(TipoUsuario.PROFESSOR === decoded.tipo){
    const { nome, duracao, topicos, idCurso } = aula;
    Validador.validarParametros([{ id }, { idCurso }, { nome }, { duracao }, { topicos }]);

    const curso = await CursoRepository.obterPorId(idCurso);

    if(curso.aulas.some(elementoAula => elementoAula.nome === nome)){
      throw new BusinessException("já existe aula com esse nome")
    }

    curso.aulas.map((a) => {
      if (a.id === id) {
        Object.keys(aula).forEach((k) => {
          a[k] = aula[k];
        });
      }
    });

    await CursoRepository.alterar({ id: idCurso }, curso);

    return new Mensagem('Aula alterado com sucesso!', {
      id,
      idCurso,
    });
  }else{
    throw new UnauthorizedException("O usuario não é professor")
  }
  }

  async excluir(id: number, idCurso: number,decoded:TokenUsuario) {
    if(TipoUsuario.PROFESSOR === decoded.tipo){
    Validador.validarParametros([{ id }, { idCurso }]);

    const curso = await CursoRepository.obterPorId(idCurso);

    curso.aulas = curso.aulas.filter((a) => a.id !== id);

    await CursoRepository.alterar({ id: idCurso }, curso);

    return new Mensagem('Aula excluido com sucesso!');
  }else{
    throw new UnauthorizedException("O usuario não é professor")
  }
}
}
