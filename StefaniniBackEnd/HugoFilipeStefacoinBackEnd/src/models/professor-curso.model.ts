import Curso from "../entities/curso.entity";

export default class ProfessorCurso {
  id: number;
  nome: string;
  email: string
  cursos?: Curso[];
  constructor() {}
}
