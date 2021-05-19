import Curso from "../entities/curso.entity";

export default class AlunoCurso {
  id: number;
  nome: string;
  email: string
  cursos?: Curso[];
  idade: number
  formacao: string
  constructor() {}
}
