import { Aluno } from './../../../stefacoin-front-main/src/app/models/aluno';
import Curso from '../entities/curso.entity';
import CursoRepository from '../repositories/curso.repository';
import { FilterQuery } from '../utils/database/database';
import Mensagem from '../utils/mensagem';
import { Validador } from '../utils/utils';
import { TipoUsuario } from '../utils/tipo-usuario.enum';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';
import TokenUsuario from '../models/token.model';
import BusinessException from '../utils/exceptions/business.exception';
import alunoRepository from '../repositories/aluno.repository';

export default class CursoController {
  async obterPorId(id: number): Promise<Curso> {
    Validador.validarParametros([{ id }]);
    return await CursoRepository.obterPorId(id);
  }

  async obter(filtro: FilterQuery<Curso> = {}): Promise<Curso> {
    return await CursoRepository.obter(filtro);
  }

  async listar(filtro: FilterQuery<Curso> = {}): Promise<Curso[]> {
    return await CursoRepository.listar(filtro);
  }

  async incluir(curso: Curso, decoded: TokenUsuario) {
    if (decoded.tipo === TipoUsuario.PROFESSOR) {
      const { nome, descricao, aulas, idProfessor } = curso;
      Validador.validarParametros([{ nome }, { descricao }, { aulas }, { idProfessor }]);
      const cursoNovo: Curso = { nome, descricao, aulas, id: 0, idProfessor, avaliacoes: [] }

      const cursosEncontrados = await CursoRepository.listar({ nome: { $eq: nome } });

      if (cursosEncontrados.length > 0) {
        throw new BusinessException("já existe um curso com esse nome")
      }

      const id = await CursoRepository.incluir(cursoNovo);
      return new Mensagem('Curso incluido com sucesso!', {
        id,
      })
    } else {
      throw new UnauthorizedException("O usuario não é professor")
    }

  }

  async alterar(id: number, curso: Curso, decoded: TokenUsuario) {
    if (TipoUsuario.PROFESSOR === decoded.tipo) {
      const { nome, descricao, aulas } = curso;
      Validador.validarParametros([{ id }, { nome }, { descricao }, { aulas }]);

      const cursosEncontrados = await CursoRepository.listar({ nome: { $eq: nome }, id: { $ne: id } });

      if (cursosEncontrados.length > 0) {
        throw new BusinessException("já existe um curso com esse nome")
      }

      await CursoRepository.alterar({ id }, curso);

      return new Mensagem('Aula alterado com sucesso!', {
        id,
      });
    } else {
      throw new UnauthorizedException("O usuario não é professor")
    }
  }

  async excluir(id: number, decoded: TokenUsuario) {
    if (TipoUsuario.PROFESSOR === decoded.tipo) {
      Validador.validarParametros([{ id }]);

      const alunoEncontrados = await alunoRepository.listar({ tipo: { $eq: TipoUsuario.ALUNO } })

      if (alunoEncontrados.some(aluno => aluno.cursos.includes(id))) {
        throw new BusinessException("Existem alunos matriculados neste curso")
      }

      await CursoRepository.excluir({ id });

      return new Mensagem('Aula excluido com sucesso!', {
        id,
      });
    } else {
      throw new UnauthorizedException("O usuario não é professor")
    }
  }

  async avaliarCurso(idCurso: number, decoded: TokenUsuario, nota: number) {
    if (decoded.tipo === TipoUsuario.ALUNO) {
      const cursosEncontrados = await CursoRepository.obterPorId(idCurso);
      const indiceCurso = cursosEncontrados.avaliacoes.findIndex(avaliacao => avaliacao.email === decoded.email)
      if (indiceCurso !== -1) {
        cursosEncontrados.avaliacoes[indiceCurso].nota = nota
      } else {
        cursosEncontrados.avaliacoes.push({ nota, email: decoded.email })
      }

      await CursoRepository.alterar({ id: idCurso }, cursosEncontrados)
      return new Mensagem('Aula avaliada com sucesso', {
        idCurso, nota,
      });
    } else {
      throw new UnauthorizedException("somente Aluno pode avaliar o Curso")
    }
  }


}
