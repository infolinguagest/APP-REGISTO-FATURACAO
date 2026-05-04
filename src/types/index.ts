export const LANGUAGE_LEVELS = ['A1', 'A1.1', 'A1.2', 'A2', 'A2.1', 'A2.2', 'B1', 'B1.1', 'B1.2', 'B2', 'B2.1', 'B2.2', 'C1', 'C1.1', 'C1.2', 'C2', 'C2.1', 'C2.2', 'SUP I', 'SUP II'];

export interface Lingua {
  code: string;
  name: string;
}

export type CourseState =
  | 'PENDENTE'
  | 'DTP CONCLUIDO'
  | 'FEITO'
  | 'A DECORRER'
  | 'EM VALIDAÇÃO'
  | 'VALIDADO'
  | 'CERTIFICADO LINGUAGEST'
  | 'CERTIFICADOS ENVIADOS RH'
  | 'CONCLUIDO'
  | 'ANULADO';

export interface DRH {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
}

export interface Empresa {
  id: string;
  nome: string;
  nifFaturacao?: string;
  drhs: DRH[];
  isB2C?: boolean;
}

export interface Formador {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  nif?: string;
  iban?: string;
  taxaIvaPadrao?: number;
  linguas?: string[];
  estado?: 'Candidato' | 'Entrevista OK' | 'Ativo' | 'Inativo';
  dataEnvioCv?: string;
  dataPrimeiraEntrevista?: string;
  observacoes?: string;
  disponibilidadeHorario?: string;
  modalidadeAula?: 'Online' | 'Presencial' | 'Ambos';
  custoHoraBase?: number;
  inicioColaboracao?: string;
}

export interface HRContact {
  name: string;
  email: string;
}

export interface Company {
  id: string;
  name: string;
  hrContacts: HRContact[];
}

export interface Trainer {
  id: string;
  name: string;
  contacts: string;
  languages: string[];
}

export interface Student {
  id: string;
  nome: string;
  email: string;
  empresaId?: string; // Ligação à Base de Empresas (B2B)
  nif?: string; // Apenas usado se for aluno particular B2C
  numeroAluno?: string; // Número do MyBlueBee (Opcional, apenas string normal)
  niveis?: string[]; // Array de strings compostas como 'ING:B1'
}

export interface CourseLog {
  id: string;
  user: string;
  timestamp: string;
  message: string;
}

export type Role = 'COORDENACAO' | 'ADMINISTRATIVO' | 'SUPORTE' | 'TODOS';

export interface Notification {
  id: string;
  courseId: string;
  courseRef: string;
  message: string;
  targetRoles: Role[];
  createdAt: string;
  read: boolean;
}

export type FaturacaoStatus = 'Por Faturar' | 'Faturado Parcial' | 'Faturado Total' | 'Pago';

export type PaymentInstallmentStatus = 'Por Faturar' | 'Faturada' | 'Paga';

export interface PaymentInstallment {
  id: string;
  valor: number;
  dataPrevista: string;
  estado: PaymentInstallmentStatus;
  dataPagamento?: string;
  descricao?: string;
  dataFaturado?: string;
  observacoes?: string;
}

export interface HonorarioFormador {
  id: string;
  mesReferencia: string;
  tipo: 'Horas' | 'Tutoria' | 'Outro';
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  estado: 'Por Faturar' | 'Faturado' | 'Pago';
  numeroRecibo?: string;
  dataRecibo?: string;
  taxaIvaAplicada?: number;
}

export interface Course {
  id: string;
  reference: string;
  previousCourseRef?: string;
  state: CourseState;
  startDate: string;
  expectedEndDate: string;
  coordenadora: string;
  local: string;
  nivel: string;
  audience?: string;
  companyId?: string;
  empresa?: string;
  hrContact?: string;
  structure: string;
  schedule: string;
  isFlexibleSchedule: boolean;
  trainerId: string;
  trainerName: string;
  trainerCost: number;
  hasTutoring: boolean;
  valorTutoria?: number;
  descricaoTutoria?: string;
  dtpLink?: string | null;
  requiresSigo: boolean;
  sigoId?: string;
  enrolledStudents?: string[];
  pagamentosAlunos?: Record<string, boolean>;
  logs?: CourseLog[];
  
  // Novas propriedades
  formadorId?: string;
  empresaId?: string;
  drhNome?: string;
  drhEmail?: string;
  
  language?: string;
  descricaoFormacao?: string;
  horasFormador?: number;
  horasPlataforma?: number;
  recursos?: string;
  observacoes?: string;
  dataConclusaoEfetiva?: string;
  modalidade?: string;
  
  // Administrativo / Faturação
  valorTotalCliente?: number;
  parcelas?: PaymentInstallment[];
  faturadoDetalhes?: string;
  numeroProposta?: string;
  dataEmissaoCertificados?: string;
  dataEnvioRH?: string;
  honorariosFormador?: HonorarioFormador[];
}
