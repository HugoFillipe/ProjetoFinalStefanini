import { TipoUsuario } from './../utils/tipo-usuario.enum';
import Aluno from '../entities/aluno.entity';
import AlunoRepository from '../repositories/aluno.repository';
import { FilterQuery } from '../utils/database/database';
import Mensagem from '../utils/mensagem';
import { Validador } from '../utils/utils';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';
import alunoRepository from '../repositories/aluno.repository';
import TokenUsuario from '../models/token.model';
import BusinessException from '../utils/exceptions/business.exception';
import cursoRepository from '../repositories/curso.repository';
import AlunoCurso from '../models/aluno-curso.model';

export default class AlunoController {
  async obterPorId(id: number): Promise<AlunoCurso> {
    Validador.validarParametros([{ id }]);
    const aluno = await alunoRepository.obterPorId(id)
    const alunoJson: AlunoCurso = await this.buscarAlunoCursos(aluno);
    return alunoJson
  }

  async obter(filtro: FilterQuery<Aluno> = {}): Promise<AlunoCurso> {
    filtro.tipo = TipoUsuario.ALUNO
    const aluno = await AlunoRepository.obter(filtro);
    const alunoJson: AlunoCurso = await this.buscarAlunoCursos(aluno);
    return alunoJson
  }

  async matricular(idCurso: number, decoded: TokenUsuario): Promise<Mensagem> {
    Validador.validarParametros([{ idCurso }]);

    if (decoded.tipo !== TipoUsuario.ALUNO) {
      throw new BusinessException("Só aluno pode se matricular em curso")
    }

    const alunoEncontrado = await alunoRepository.obter({ email: { $eq: decoded.email } })
    const cursoEncontrado = await cursoRepository.obterPorId(idCurso)

    if (!cursoEncontrado) {
      throw new BusinessException("Curso não encontrado")
    }

    if (alunoEncontrado.cursos.includes(idCurso)) {
      throw new BusinessException("Aluno já está matriculado neste curso")
    }

    alunoEncontrado.cursos.push(idCurso)
    await AlunoRepository.alterar({ id: alunoEncontrado.id }, alunoEncontrado);

    return new Mensagem('Aluno matriculado com sucesso', {
      cursoEncontrado,
    });
  }

  // #pegabandeira
  async listar(filtro: FilterQuery<Aluno> = {}): Promise<AlunoCurso[]> {
    filtro.tipo = TipoUsuario.ALUNO
    const alunoEncontrados = await AlunoRepository.listar(filtro);

    const alunosComCursos = []

    for (const aluno of alunoEncontrados) {
      const alunoComCurso = await this.buscarAlunoCursos(aluno);
      alunosComCursos.push(alunoComCurso)
    }

    return alunosComCursos
  }

  // #pegabandeira
  async incluir(aluno: Aluno) {
    const { nome, formacao, idade, email, senha } = aluno;
    Validador.validarParametros([{ nome }, { formacao }, { idade }, { email }, { senha }]);
    const alunoNovo: Aluno = { nome, formacao, idade, email, senha, cursos: [], id: 0, tipo: 2 }

    const id = await AlunoRepository.incluir(alunoNovo);
    return new Mensagem('Aluno incluido com sucesso!', {
      id,
    });
  }

  async alterar(id: number, aluno: Aluno, decoded: TokenUsuario) {
    const { nome, formacao, idade, email, senha } = aluno;
    Validador.validarParametros([{ nome }, { formacao }, { idade }, { email }, { senha }, { id }]);
    const alunoEncontrado = await alunoRepository.obterPorId(id)

    if (alunoEncontrado.email !== aluno.email) {
      throw new BusinessException('Não pode trocar Email')
    }

    if ((TipoUsuario.PROFESSOR === decoded.tipo) || (decoded.email === alunoEncontrado.email)) {
      alunoEncontrado.nome = nome;
      alunoEncontrado.formacao = formacao;
      alunoEncontrado.idade = idade;
      alunoEncontrado.senha = senha;

      await AlunoRepository.alterar({ id }, alunoEncontrado);
      return new Mensagem('Aluno alterado com sucesso!', {
        id,
      });
    } else {
      throw new UnauthorizedException("Apenas professor ou o proprio aluno pode realizar a alteração")
    }
  }

  async excluir(id: number, decoded: TokenUsuario) {
    if (TipoUsuario.PROFESSOR === decoded.tipo) {
      Validador.validarParametros([{ id }]);
      const alunoEncontrado = await alunoRepository.obterPorId(id)

      if (alunoEncontrado.cursos.length > 0) {
        throw new BusinessException("O aluno está matriculado no curso")
      }
      await AlunoRepository.excluir({ id });

      return new Mensagem('Aluno excluido com sucesso!', {
        id,
      });
    } else {
      throw new UnauthorizedException("Somente professor pode excluir")
    }
  }


  private async buscarAlunoCursos(aluno: Aluno): Promise<AlunoCurso> {
    const cursosLocalizados = [];

    for (const idCurso of aluno.cursos) {
      const cursoEncontrado = await cursoRepository.obterPorId(idCurso);
      cursosLocalizados.push(cursoEncontrado);
    }

    const alunoComCursos: AlunoCurso = {
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
      cursos: cursosLocalizados,
      idade: Number(aluno.idade),
      formacao: aluno.formacao
    };
    return alunoComCursos;
  }
}
