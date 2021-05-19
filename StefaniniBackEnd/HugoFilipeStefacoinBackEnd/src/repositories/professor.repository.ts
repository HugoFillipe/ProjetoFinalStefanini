import { Usuario } from './../../../stefacoin-front-main/src/app/models/usuario';
import Professor from '../entities/professor.entity';
import { FilterQuery } from '../utils/database/database';
import { Tables } from '../utils/tables.enum';
import { TipoUsuario } from '../utils/tipo-usuario.enum';
import { Validador } from '../utils/utils';
import Repository from './repository';
import UnauthorizedException from '../utils/exceptions/unauthorized.exception';

class ProfessorRepository extends Repository<Professor> {
  constructor() {
    super(Tables.USUARIO);
  }

  async incluir(professor: Professor) {
    professor.nome = Validador.validarNome(professor.nome)
    professor.email = await Validador.validarEmail(professor.email)
    professor.senha = Validador.criptografarSenha(professor.senha);
    professor.tipo = TipoUsuario.PROFESSOR;
    return super.incluir(professor);
  }

  async alterar(filtro: FilterQuery<Professor>, professor: Professor) {
    if (professor.senha) {
      professor.senha = Validador.criptografarSenha(professor.senha);
    }
    return super.alterar(filtro, professor);
  }
}

export default new ProfessorRepository();
