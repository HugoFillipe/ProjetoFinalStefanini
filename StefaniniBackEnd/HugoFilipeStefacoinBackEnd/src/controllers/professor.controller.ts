import Professor from '../entities/professor.entity';
import ProfessorCurso from '../models/professor-curso.model';
import TokenUsuario from '../models/token.model';
import cursoRepository from '../repositories/curso.repository';
import professorRepository from '../repositories/professor.repository';
import ProfessorRepository from '../repositories/professor.repository';
import usuarioRepository from '../repositories/usuario.repository';
import { FilterQuery } from '../utils/database/database';
import BusinessException from '../utils/exceptions/business.exception';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';
import Mensagem from '../utils/mensagem';
import { TipoUsuario } from '../utils/tipo-usuario.enum';
import { Validador } from '../utils/utils';

export default class ProfessorController {
  async obterPorId(id: number): Promise<ProfessorCurso> {
    Validador.validarParametros([{ id }]);
    const professor = await ProfessorRepository.obterPorId(id)

    const professorJson: ProfessorCurso = await this.buscarProfessorCursos(professor);
    return professorJson
  }

  async obter(filtro: FilterQuery<Professor> = {}): Promise<ProfessorCurso> {
    filtro.tipo = TipoUsuario.PROFESSOR
    const professor = await ProfessorRepository.obter(filtro);
    const professorJson: ProfessorCurso = await this.buscarProfessorCursos(professor);
    return professorJson
  }


  // #pegabandeira
  async listar(filtro: FilterQuery<Professor> = {}): Promise<Professor[]> {
    filtro.tipo = TipoUsuario.PROFESSOR
    const professorEncontrados = await ProfessorRepository.listar(filtro);

    const professoresComCursos = []

    for (const professor of professorEncontrados) {
      const professorComCurso = await this.buscarProfessorCursos(professor);
      professoresComCursos.push(professorComCurso)
    }

    return professoresComCursos
  }

  // #pegabandeira
  async incluir(professor: Professor) {
    const { nome, email, senha } = professor;
    Validador.validarParametros([{ nome }, { email }, { senha }]);
    const professorNovo: Professor = { nome, email, senha, id: 0, tipo: 1 }
    if (professorNovo.tipo === TipoUsuario.PROFESSOR) {
      const id = await ProfessorRepository.incluir(professorNovo);
      return new Mensagem(`Professor incluido com sucesso!`, {
        id,
      })
    } else {
      throw new UnauthorizedException("O usuario não é professor")
    }
  }

  async alterar(id: number, professor: Professor, decoded: TokenUsuario) {
    const { nome, email, senha } = professor;
    Validador.validarParametros([{ nome }, { email }, { senha }, { id }]);
    const professorEncontrado = await professorRepository.obterPorId(id)

    if (professorEncontrado.email !== professor.email) {
      throw new BusinessException('Não pode trocar Email')
    }

    if ((TipoUsuario.PROFESSOR === decoded.tipo) &&  (decoded.email === professorEncontrado.email)) {
      await ProfessorRepository.alterar({ id }, professor);
      return new Mensagem('Professor alterado com sucesso!', {
        id,
      });
    } else {
      throw new UnauthorizedException("O usuario não é professor")
    }
  }
  async excluir(id: number, decoded: TokenUsuario) {
    if (TipoUsuario.PROFESSOR === decoded.tipo) {
      Validador.validarParametros([{ id }]);

      const cursosEncontrados = await cursoRepository.listar({ idProfessor: { $eq:id } });

      if(cursosEncontrados.length > 0){
        throw new BusinessException("o professor está vinculado a algum curso")
      }

      await ProfessorRepository.excluir({ id });

      return new Mensagem('Professor excluido com sucesso!', {
        id,
      })
    } else {
      throw new UnauthorizedException("O usuario não é professor")
    }
  }
  private async buscarProfessorCursos(professor: Professor): Promise<ProfessorCurso> {

    const cursosEncontrados = await cursoRepository.listar({ idProfessor: { $eq: professor.id } });

    const professoresComCursos: ProfessorCurso = {
      id: professor.id,
      nome: professor.nome,
      email: professor.email,
      cursos: cursosEncontrados

    };
    return professoresComCursos;
  }
}