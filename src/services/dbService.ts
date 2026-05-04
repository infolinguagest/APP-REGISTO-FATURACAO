import { Course, Company, Trainer, CourseState, Notification, Student, Role, Formador, Empresa, CourseLog, Lingua, HonorarioFormador } from '../types';

export const STATUS_ROUTING_MAP: Record<string, Role[]> = {
  'DTP CONCLUIDO': ['ADMINISTRATIVO'],
  'EM VALIDAÇÃO': ['COORDENACAO'],
  'VALIDADO': ['SUPORTE', 'ADMINISTRATIVO'],
  'CERTIFICADO LINGUAGEST': ['COORDENACAO']
};

let mockLinguas: Lingua[] = [
  { code: 'ING', name: 'Inglês' },
  { code: 'FRA', name: 'Francês' },
  { code: 'ALE', name: 'Alemão' },
  { code: 'ESP', name: 'Espanhol' },
  { code: 'POR', name: 'Português' }
];

export const getLinguas = async (): Promise<Lingua[]> => {
  return [...mockLinguas].sort((a, b) => a.name.localeCompare(b.name));
};

export const addLingua = async (lingua: Lingua): Promise<boolean> => {
  if (mockLinguas.some(l => l.code === lingua.code)) {
    return false;
  }
  mockLinguas.push(lingua);
  return true;
};

let mockNotifications: Notification[] = [];

export const mockStudents: Student[] = [
  { id: 's1', numeroAluno: 'A001', nome: 'Rui Silva', email: 'rui.silva@example.com', empresaId: 'emp1', niveis: ['ALE:A2'] },
  { id: 's2', numeroAluno: 'A002', nome: 'Sofia Costa', email: 'sofia.costa@example.com', empresaId: 'emp1', niveis: ['ING:B1', 'FRA:A1'] },
  { id: 's3', numeroAluno: 'A003', nome: 'Miguel Oliveira', email: 'miguel.o@example.com', nif: '123456789', niveis: ['ING:A1'] },
  { id: 's4', numeroAluno: 'A004', nome: 'Beatriz Santos', email: 'beatriz.s@example.com', nif: '987654321', niveis: ['ESP:B2'] }
];

export const mockCompanies: Company[] = [
  {
    id: 'emp1',
    name: 'Mercedes-Benz',
    hrContacts: [
      { name: 'João Silva', email: 'joao.silva@mercedes.com' },
      { name: 'Maria Santos', email: 'maria.santos@mercedes.com' }
    ]
  },
  {
    id: 'emp2',
    name: 'Siemens',
    hrContacts: [
      { name: 'Carlos Costa', email: 'carlos.costa@siemens.com' }
    ]
  }
];

export const mockTrainers: Trainer[] = [
  { id: 't1', name: 'John Doe', contacts: 'john@example.com', languages: ['ING'] },
  { id: 't2', name: 'Marie Curie', contacts: 'marie@example.com', languages: ['FRA', 'ING'] },
  { id: 't3', name: 'Hans Müller', contacts: 'hans@example.com', languages: ['ALE'] }
];

export const mockFormadores: Formador[] = [
  { id: 'f1', nome: 'Hans Müller', email: 'hans@example.com', telefone: '912345678', nif: '123456789', estado: 'Ativo', linguas: ['ALE'], modalidadeAula: 'Ambos', custoHoraBase: 25, inicioColaboracao: '2023-01-10', taxaIvaPadrao: 0 },
  { id: 'f2', nome: 'John Doe', email: 'john@example.com', telefone: '923456789', nif: '234567891', estado: 'Ativo', linguas: ['ING'], modalidadeAula: 'Online', custoHoraBase: 20, dataEnvioCv: '2024-05-20', inicioColaboracao: '2024-06-01', taxaIvaPadrao: 23 },
  { id: 'f3', nome: 'Marie Curie', email: 'marie@example.com', telefone: '934567891', nif: '345678912', estado: 'Inativo', linguas: ['FRA', 'ING'], modalidadeAula: 'Presencial', custoHoraBase: 28 },
  { id: 'f4', nome: 'Isabella Rossi', email: 'isabella@example.com', telefone: '945678912', nif: '456789123', estado: 'Candidato', linguas: ['ITA', 'ESP'], dataEnvioCv: '2026-04-20', observacoes: 'CV muito forte, aguarda entrevista' },
  { id: 'f5', nome: 'Pedro Marques', email: 'pedro@example.com', telefone: '956789123', estado: 'Entrevista OK', linguas: ['POR', 'ING'], dataEnvioCv: '2026-04-10', dataPrimeiraEntrevista: '2026-04-15', disponibilidadeHorario: 'Pós-laboral' }
];

export const mockEmpresas: Empresa[] = [
  { 
    id: 'emp_linguagest', 
    nome: 'Linguagest', 
    drhs: [], 
    isB2C: true 
  },
  { 
    id: 'emp1', 
    nome: 'Mercedes-Benz', 
    nifFaturacao: '500123456',
    drhs: [
      { id: 'drh1', nome: 'João Silva', email: 'joao.silva@mercedes.com', telefone: '911111111' },
      { id: 'drh2', nome: 'Maria Santos', email: 'maria.santos@mercedes.com' }
    ], 
    isB2C: false 
  },
  { 
    id: 'emp2', 
    nome: 'Siemens', 
    nifFaturacao: '500654321',
    drhs: [
      { id: 'drh3', nome: 'Carlos Costa', email: 'carlos.costa@siemens.com', telefone: '922222222' }
    ], 
    isB2C: false 
  }
];

const mockCourses: Course[] = [
  {
    id: 'c1',
    reference: '067/26-ALE-V-B',
    state: 'PENDENTE',
    language: 'Alemão',
    startDate: '2026-04-01',
    expectedEndDate: '2026-06-30',
    coordenadora: 'Isabella Zanutta',
    local: 'Teams',
    nivel: 'A1',
    audience: 'B',
    companyId: 'emp1',
    empresa: 'Mercedes-Benz',
    hrContact: 'João Silva',
    structure: '40 horas - 2x por semana',
    schedule: 'Segundas e Quartas 18h-20h',
    isFlexibleSchedule: false,
    trainerId: 't3',
    trainerName: 'Hans Müller',
    trainerCost: 25,
    hasTutoring: false,
    dtpLink: 'https://drive.google.com/...',
    requiresSigo: true,
    parcelas: [
      {
        id: 'p1',
        valor: 1000,
        dataPrevista: '2026-04-01',
        estado: 'Por Faturar'
      }
    ],
    descricaoFormacao: 'Curso de Alemão A1 para colaboradores',
    horasFormador: 40,
    horasPlataforma: 0,
    recursos: 'Manual Schritte International',
    observacoes: 'Turma com 15 alunos',
    modalidade: 'Corp. Online',
    dataConclusaoEfetiva: '',
    enrolledStudents: ['s1', 's2'],
    honorariosFormador: [
      {
        id: 'h1',
        mesReferencia: '2026-03',
        tipo: 'Horas',
        quantidade: 10,
        valorUnitario: 25,
        valorTotal: 250,
        estado: 'Por Faturar'
      }
    ],
    logs: [
      {
        id: 'l1',
        user: 'Ana Silva',
        timestamp: '2026-03-20T10:30:00Z',
        message: 'Curso criado e a aguardar confirmação do formador.'
      }
    ]
  },
  {
    id: 'c2',
    reference: '068/26-ING-P-L',
    state: 'DTP CONCLUIDO',
    language: 'Inglês',
    startDate: '2026-04-15',
    expectedEndDate: '2026-07-15',
    coordenadora: 'Elena Puentes',
    local: 'Presencial Linguagest',
    nivel: 'B1',
    audience: 'C',
    empresa: 'Linguagest',
    structure: '60 horas - Intensivo',
    schedule: 'Diário 10h-13h',
    isFlexibleSchedule: false,
    trainerId: 't1',
    trainerName: 'John Doe',
    trainerCost: 20,
    hasTutoring: true,
    valorTutoria: 50,
    descricaoTutoria: 'Pagamento extra de 50€ no final',
    dtpLink: 'https://drive.google.com/...',
    requiresSigo: false,
    parcelas: [
      {
        id: 'p2',
        valor: 600,
        dataPrevista: '2026-04-15',
        estado: 'Faturada'
      },
      {
        id: 'p3',
        valor: 600,
        dataPrevista: '2026-05-15',
        estado: 'Por Faturar'
      }
    ],
    descricaoFormacao: 'Inglês B1 Intensivo',
    horasFormador: 60,
    horasPlataforma: 10,
    recursos: 'English File Intermediate',
    observacoes: 'Aluno focado em conversação',
    modalidade: 'Presencial 1 Nível',
    dataConclusaoEfetiva: '',
    enrolledStudents: ['s3'],
    honorariosFormador: [
      {
        id: 'h2',
        mesReferencia: '2026-02',
        tipo: 'Horas',
        quantidade: 5,
        valorUnitario: 20,
        valorTotal: 100,
        estado: 'Pago',
        numeroRecibo: 'REC-2026-001'
      }
    ],
    logs: [
      {
        id: 'l2',
        user: 'Marta Gomes',
        timestamp: '2026-03-21T14:15:00Z',
        message: 'DTP preenchido e validado. Ficheiros na drive.'
      },
      {
        id: 'l3',
        user: 'Sistema',
        timestamp: '2026-03-21T14:15:01Z',
        message: 'Estado alterado para DTP CONCLUIDO'
      }
    ]
  },
  {
    id: 'c3',
    reference: '069/26-FRA-V-B',
    state: 'FEITO',
    language: 'Francês',
    startDate: '2026-03-01',
    expectedEndDate: '2026-05-30',
    coordenadora: 'Ana Silva',
    local: 'Zoom',
    nivel: 'A2',
    audience: 'B',
    companyId: 'emp2',
    empresa: 'Siemens',
    hrContact: 'Carlos Costa',
    structure: '30 horas',
    schedule: 'Flexível',
    isFlexibleSchedule: true,
    trainerId: 't2',
    trainerName: 'Marie Curie',
    trainerCost: 30,
    hasTutoring: false,
    dtpLink: 'https://drive.google.com/...',
    requiresSigo: true,
    sigoId: 'SIGO-2026-001',
    parcelas: [
      {
        id: 'p4',
        valor: 1500,
        dataPrevista: '2026-03-01',
        estado: 'Faturada'
      }
    ],
    logs: []
  },
  {
    id: 'c4',
    reference: '070/26-ESP-P-B',
    state: 'A DECORRER',
    language: 'Espanhol',
    startDate: '2026-02-15',
    expectedEndDate: '2026-03-20',
    coordenadora: 'Marta Gomes',
    local: 'Presencial Cliente',
    nivel: 'C1',
    audience: 'B',
    empresa: 'Iberian Imports',
    hrContact: 'Maria Lopez',
    structure: '50 horas',
    schedule: 'Sextas 14h-18h',
    isFlexibleSchedule: false,
    trainerId: 't1',
    trainerName: 'John Doe',
    trainerCost: 22,
    hasTutoring: false,
    dtpLink: 'https://drive.google.com/...',
    requiresSigo: true,
    sigoId: 'SIGO-2026-002',
    parcelas: [
      {
        id: 'p5',
        valor: 2000,
        dataPrevista: '2026-02-15',
        estado: 'Paga',
        dataPagamento: '2026-03-01'
      }
    ],
    logs: []
  },
  {
    id: 'c5',
    reference: '071/26-ING-V-B',
    state: 'EM VALIDAÇÃO',
    language: 'Inglês',
    startDate: '2026-01-10',
    expectedEndDate: '2026-03-10',
    coordenadora: 'Ana Silva',
    local: 'Sala Virtual Moodle',
    nivel: 'B2',
    audience: 'B',
    companyId: 'emp1',
    empresa: 'Mercedes-Benz',
    hrContact: 'Maria Santos',
    structure: '40 horas',
    schedule: 'Terças e Quintas 18h-20h',
    isFlexibleSchedule: false,
    trainerId: 't3',
    trainerName: 'Hans Müller',
    trainerCost: 25,
    hasTutoring: true,
    valorTutoria: 100,
    descricaoTutoria: 'Acompanhamento semanal',
    dtpLink: 'https://drive.google.com/...',
    requiresSigo: true,
    sigoId: 'SIGO-2026-003',
    parcelas: [
      {
        id: 'p6',
        valor: 800,
        dataPrevista: '2026-01-10',
        estado: 'Faturada'
      },
      {
        id: 'p7',
        valor: 800,
        dataPrevista: '2026-02-10',
        estado: 'Por Faturar'
      }
    ],
    logs: []
  },
  {
    id: 'c6',
    reference: '072/26-FRA-P-L',
    state: 'VALIDADO',
    language: 'Francês',
    startDate: '2025-11-01',
    expectedEndDate: '2026-02-28',
    coordenadora: 'Marta Gomes',
    local: 'Presencial Linguagest',
    nivel: 'A1.1',
    audience: 'C',
    empresa: 'Linguagest',
    structure: '60 horas',
    schedule: 'Sábados 9h-13h',
    isFlexibleSchedule: false,
    trainerId: 't2',
    trainerName: 'Marie Curie',
    trainerCost: 28,
    hasTutoring: false,
    dtpLink: 'https://drive.google.com/...',
    requiresSigo: false,
    parcelas: [
      {
        id: 'p8',
        valor: 1200,
        dataPrevista: '2025-11-01',
        estado: 'Paga',
        dataPagamento: '2025-11-15'
      }
    ],
    logs: []
  },
  {
    id: 'c7',
    reference: '073/26-ALE-V-B',
    state: 'CERTIFICADO LINGUAGEST',
    language: 'Alemão',
    startDate: '2025-10-15',
    expectedEndDate: '2026-01-15',
    coordenadora: 'Ana Silva',
    local: 'Teams',
    nivel: 'B1.2',
    audience: 'B',
    companyId: 'emp2',
    empresa: 'Siemens',
    hrContact: 'Carlos Costa',
    structure: '50 horas',
    schedule: 'Segundas 10h-12h',
    isFlexibleSchedule: false,
    trainerId: 't3',
    trainerName: 'Hans Müller',
    trainerCost: 25,
    hasTutoring: false,
    dtpLink: 'https://drive.google.com/...',
    requiresSigo: true,
    sigoId: 'SIGO-2026-004',
    parcelas: [
      {
        id: 'p9',
        valor: 1000,
        dataPrevista: '2025-10-15',
        estado: 'Faturada'
      }
    ],
    logs: []
  },
  {
    id: 'c8',
    reference: '074/26-ING-P-B',
    state: 'CERTIFICADOS ENVIADOS RH',
    language: 'Inglês',
    startDate: '2025-09-01',
    expectedEndDate: '2025-12-15',
    coordenadora: 'Marta Gomes',
    local: 'Recurso do Formador',
    nivel: 'C2',
    audience: 'B',
    companyId: 'emp1',
    empresa: 'Mercedes-Benz',
    hrContact: 'João Silva',
    structure: '40 horas',
    schedule: 'Quartas 14h-18h',
    isFlexibleSchedule: false,
    trainerId: 't1',
    trainerName: 'John Doe',
    trainerCost: 20,
    hasTutoring: false,
    dtpLink: 'https://drive.google.com/...',
    requiresSigo: true,
    sigoId: 'SIGO-2026-005',
    parcelas: [
      {
        id: 'p10',
        valor: 800,
        dataPrevista: '2025-09-01',
        estado: 'Paga',
        dataPagamento: '2025-09-15'
      }
    ],
    logs: []
  },
  {
    id: 'c9',
    reference: '075/25-ESP-V-L',
    state: 'CONCLUIDO',
    language: 'Espanhol',
    startDate: '2025-05-01',
    expectedEndDate: '2025-08-31',
    coordenadora: 'Ana Silva',
    local: 'Zoom',
    nivel: 'SUP I',
    audience: 'C',
    empresa: 'Linguagest',
    structure: '60 horas',
    schedule: 'Terças e Quintas 19h-21h',
    isFlexibleSchedule: false,
    trainerId: 't2',
    trainerName: 'Marie Curie',
    trainerCost: 28,
    hasTutoring: false,
    dtpLink: 'https://drive.google.com/...',
    requiresSigo: false,
    parcelas: [
      {
        id: 'p12',
        valor: 1800,
        dataPrevista: '2025-05-01',
        estado: 'Paga',
        dataPagamento: '2025-05-15'
      }
    ],
    logs: []
  },
  {
    id: 'c10',
    reference: '076/25-ALE-P-B',
    state: 'ANULADO',
    language: 'Alemão',
    startDate: '2025-06-01',
    expectedEndDate: '2025-09-30',
    coordenadora: 'Marta Gomes',
    local: 'Presencial Cliente',
    nivel: 'A2.2',
    audience: 'B',
    companyId: 'emp2',
    empresa: 'Siemens',
    hrContact: 'Carlos Costa',
    structure: '40 horas',
    schedule: 'Sextas 9h-13h',
    isFlexibleSchedule: false,
    trainerId: 't3',
    trainerName: 'Hans Müller',
    trainerCost: 25,
    hasTutoring: false,
    dtpLink: 'https://drive.google.com/...',
    requiresSigo: true,
    sigoId: 'SIGO-2026-006',
    parcelas: [
      {
        id: 'p11',
        valor: 1000,
        dataPrevista: '2025-06-01',
        estado: 'Por Faturar'
      }
    ],
    logs: []
  }
];

// Atualização programática dos mockCourses para a Fase 2
mockCourses.forEach(course => {
  // 1. Formador
  const formador = mockFormadores.find(f => f.nome === course.trainerName);
  if (formador) {
    course.formadorId = formador.id;
  }

  // 2. Empresa e DRH
  const empresa = mockEmpresas.find(e => e.nome === course.empresa);
  if (empresa) {
    course.empresaId = empresa.id;
    
    // 3. DRH (Desnormalização)
    if (empresa.isB2C) {
      course.drhNome = 'n/a';
      course.drhEmail = 'n/a';
    } else if (empresa.drhs && empresa.drhs.length > 0) {
      course.drhNome = empresa.drhs[0].nome;
      course.drhEmail = empresa.drhs[0].email;
    }
  }
});

export const getFormadores = async (): Promise<Formador[]> => {
  return [...mockFormadores];
};

export const addFormador = async (formador: Omit<Formador, 'id'>): Promise<Formador> => {
  const newFormador: Formador = {
    ...formador,
    id: `form_${Date.now()}`
  };
  mockFormadores.push(newFormador);
  return newFormador;
};

export const updateFormador = async (id: string, updates: Partial<Formador>): Promise<Formador> => {
  const index = mockFormadores.findIndex(f => f.id === id);
  if (index === -1) throw new Error('Formador não encontrado');
  
  mockFormadores[index] = { ...mockFormadores[index], ...updates };
  return mockFormadores[index];
};

export const deleteFormador = async (id: string): Promise<void> => {
  const index = mockFormadores.findIndex(f => f.id === id);
  if (index > -1) {
    mockFormadores.splice(index, 1);
  }
};

export const getEmpresas = async (): Promise<Empresa[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockEmpresas]);
    }, 400);
  });
};

export const addEmpresa = async (empresa: Omit<Empresa, 'id' | 'isB2C'>): Promise<Empresa> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newEmpresa: Empresa = {
        ...empresa,
        id: `emp_${Date.now()}`,
        isB2C: false
      };
      mockEmpresas.push(newEmpresa);
      resolve(newEmpresa);
    }, 400);
  });
};

export const updateEmpresa = async (id: string, updates: Partial<Empresa>): Promise<Empresa> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEmpresas.findIndex(e => e.id === id);
      if (index === -1) return reject(new Error('Empresa não encontrada'));
      
      // Prevent changing isB2C flag
      const safeUpdates = { ...updates };
      delete safeUpdates.isB2C;

      mockEmpresas[index] = { ...mockEmpresas[index], ...safeUpdates };
      resolve({ ...mockEmpresas[index] });
    }, 400);
  });
};

export const deleteEmpresa = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 'emp_linguagest') {
        return reject(new Error('Não é possível apagar a entidade de sistema Linguagest'));
      }
      const index = mockEmpresas.findIndex(e => e.id === id);
      if (index > -1) {
        mockEmpresas.splice(index, 1);
      }
      resolve();
    }, 400);
  });
};

export const getTrainers = async (): Promise<Trainer[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockTrainers]);
    }, 400);
  });
};

export const getActiveCourses = async (): Promise<Course[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockCourses]);
    }, 800);
  });
};

export const getAlunos = async (): Promise<Student[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockStudents]);
    }, 400);
  });
};
export const getStudents = getAlunos;

export const getStudentCourseHistory = async (studentId: string): Promise<Course[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const history = mockCourses.filter(c => c.enrolledStudents?.includes(studentId));
      resolve(history);
    }, 300);
  });
};

export const updateAluno = async (id: string, alunoData: Partial<Student>): Promise<Student> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockStudents.findIndex(s => s.id === id);
      if (index === -1) return reject(new Error('Student not found'));
      
      mockStudents[index] = { ...mockStudents[index], ...alunoData };
      resolve({ ...mockStudents[index] });
    }, 300);
  });
};
export const updateStudent = updateAluno;

export const addAluno = async (aluno: Omit<Student, 'id'>): Promise<Student> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newStudent: Student = {
        ...aluno,
        id: `s${Date.now()}`
      };
      mockStudents.push(newStudent);
      resolve(newStudent);
    }, 400);
  });
};
export const createNewStudent = addAluno;

export const deleteAluno = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockStudents.findIndex(s => s.id === id);
      if (index === -1) return reject(new Error('Student not found'));
      
      mockStudents.splice(index, 1);
      resolve();
    }, 400);
  });
};

export const enrollStudent = async (courseId: string, studentId: string, user: string): Promise<Course> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const courseIndex = mockCourses.findIndex(c => c.id === courseId);
      if (courseIndex === -1) {
        return reject(new Error('Course not found'));
      }
      
      const course = mockCourses[courseIndex];
      const student = mockStudents.find(s => s.id === studentId);
      
      if (!student) {
        return reject(new Error('Student not found'));
      }

      if (!course.enrolledStudents) {
        course.enrolledStudents = [];
      }
      
      if (!course.enrolledStudents.includes(studentId)) {
        course.enrolledStudents.push(studentId);
        
        const newLog = {
          id: `l${Date.now()}`,
          user: user,
          timestamp: new Date().toISOString(),
          message: `[SISTEMA] Aluno ${student.nome} inscrito no curso.`
        };
        
        course.logs = [...(course.logs || []), newLog];
      }
      
      resolve({ ...course });
    }, 400);
  });
};

export const unenrollStudent = async (courseId: string, studentId: string, user: string): Promise<Course> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const courseIndex = mockCourses.findIndex(c => c.id === courseId);
      if (courseIndex === -1) {
        return reject(new Error('Course not found'));
      }
      
      const course = mockCourses[courseIndex];
      const student = mockStudents.find(s => s.id === studentId);
      
      if (!student) {
        return reject(new Error('Student not found'));
      }

      if (course.enrolledStudents && course.enrolledStudents.includes(studentId)) {
        course.enrolledStudents = course.enrolledStudents.filter(id => id !== studentId);
        
        const newLog = {
          id: `l${Date.now()}`,
          user: user,
          timestamp: new Date().toISOString(),
          message: `[SISTEMA] Inscrição do aluno ${student.nome} cancelada.`
        };
        
        course.logs = [...(course.logs || []), newLog];
      }
      
      resolve({ ...course });
    }, 400);
  });
};

export const toggleStudentPayment = async (courseId: string, studentId: string, currentStatus: boolean, userName: string = 'Sistema'): Promise<Course> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const courseIndex = mockCourses.findIndex(c => c.id === courseId);
      if (courseIndex === -1) {
        return reject(new Error('Course not found'));
      }

      const course = mockCourses[courseIndex];
      const pagamentosAlunos = { ...(course.pagamentosAlunos || {}) };
      pagamentosAlunos[studentId] = !currentStatus;

      const newLog: CourseLog = {
        id: `log_${Date.now()}`,
        user: userName,
        timestamp: new Date().toISOString(),
        message: `Estado de pagamento do aluno atualizado para ${!currentStatus ? 'Pago' : 'Pendente'}.`
      };

      mockCourses[courseIndex] = {
        ...course,
        pagamentosAlunos,
        logs: [...(course.logs || []), newLog]
      };

      resolve({ ...mockCourses[courseIndex] });
    }, 400);
  });
};

export const updateCourseDetails = async (courseId: string, data: Partial<Course>, user: string): Promise<Course> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockCourses.findIndex(c => c.id === courseId);
      if (index === -1) return reject(new Error('Course not found'));

      mockCourses[index] = { ...mockCourses[index], ...data };

      const newLog = {
        id: `l${Date.now()}`,
        user,
        timestamp: new Date().toISOString(),
        message: `[SISTEMA] Dados administrativos/financeiros atualizados.`
      };
      mockCourses[index].logs = [...(mockCourses[index].logs || []), newLog];

      resolve({ ...mockCourses[index] });
    }, 400);
  });
};

export const createCourse = async (courseData: Omit<Course, 'id' | 'state'>): Promise<Course> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCourse: Course = {
        ...courseData,
        id: `c${Date.now()}`,
        state: 'PENDENTE',
        parcelas: [],
        logs: [
          {
            id: `l${Date.now()}`,
            user: 'Sistema',
            timestamp: new Date().toISOString(),
            message: 'Curso criado.'
          }
        ]
      };
      mockCourses.push(newCourse);
      resolve(newCourse);
    }, 800);
  });
};

export const updateCourseStatus = async (courseId: string, newState: CourseState, user: string): Promise<Course> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const courseIndex = mockCourses.findIndex(c => c.id === courseId);
      if (courseIndex === -1) {
        return reject(new Error('Course not found'));
      }
      
      const course = mockCourses[courseIndex];
      course.state = newState;
      
      const newLog = {
        id: `l${Date.now()}`,
        user: user,
        timestamp: new Date().toISOString(),
        message: `Estado alterado para ${newState}`
      };
      
      course.logs = [...(course.logs || []), newLog];

      if (STATUS_ROUTING_MAP[newState]) {
        addNotification(
          course.id,
          course.reference,
          `O estado do curso ${course.reference} mudou para ${newState}.`,
          STATUS_ROUTING_MAP[newState]
        );
      }
      
      resolve({ ...course });
    }, 600);
  });
};

export const addCourseLog = async (courseId: string, message: string, user: string): Promise<Course> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const courseIndex = mockCourses.findIndex(c => c.id === courseId);
      if (courseIndex === -1) {
        return reject(new Error('Course not found'));
      }
      
      const course = mockCourses[courseIndex];
      const newLog = {
        id: `l${Date.now()}`,
        user,
        timestamp: new Date().toISOString(),
        message
      };
      
      course.logs = [...(course.logs || []), newLog];
      
      resolve({ ...course });
    }, 400);
  });
};

export const getNotifications = async (): Promise<Notification[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockNotifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 300);
  });
};

export const addNotification = async (courseId: string, courseRef: string, message: string, targetRoles: Role[] = ['TODOS']): Promise<Notification> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newNotif: Notification = {
        id: `n${Date.now()}-${Math.random()}`,
        courseId,
        courseRef,
        message,
        targetRoles,
        createdAt: new Date().toISOString(),
        read: false
      };
      mockNotifications.push(newNotif);
      resolve(newNotif);
    }, 200);
  });
};

export const createManualNotification = async (courseId: string, courseRef: string, message: string, targetRoles: Role[]): Promise<Notification> => {
  const formattedMessage = `Nova nota em ${courseRef}: ${message}`;
  return addNotification(courseId, courseRef, formattedMessage, targetRoles);
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const notif = mockNotifications.find(n => n.id === notificationId);
      if (notif) {
        notif.read = true;
      }
      resolve();
    }, 200);
  });
};

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const course = mockCourses.find(c => c.id === courseId);
      resolve(course ? { ...course } : null);
    }, 300);
  });
};

export const getCourseByRef = async (reference: string): Promise<Course | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const course = mockCourses.find(c => c.reference === reference);
      resolve(course ? { ...course } : null);
    }, 300);
  });
};

export const checkAndUpdateCourseStatuses = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];

      mockCourses.forEach(course => {
        if (course.state === 'A DECORRER' && course.expectedEndDate <= today) {
          course.state = 'EM VALIDAÇÃO';
          
          const newLog = {
            id: `l${Date.now()}-${Math.random()}`,
            user: 'Sistema',
            timestamp: new Date().toISOString(),
            message: '[SISTEMA] Estado alterado para EM VALIDAÇÃO (Data atingida).'
          };
          course.logs = [...(course.logs || []), newLog];

          const newNotif: Notification = {
            id: `n${Date.now()}-${Math.random()}`,
            courseId: course.id,
            courseRef: course.reference,
            message: 'O curso atingiu a data de conclusão e passou para EM VALIDAÇÃO.',
            targetRoles: ['COORDENACAO'],
            createdAt: new Date().toISOString(),
            read: false
          };
          mockNotifications.push(newNotif);
        }
      });

      resolve();
    }, 500);
  });
};

export const exportDatabaseBackup = () => {
  const data = {
    courses: mockCourses,
    empresas: mockEmpresas,
    formadores: mockFormadores,
    alunos: mockStudents,
    notifications: mockNotifications,
    companies: mockCompanies,
    trainers: mockTrainers
  };
  return JSON.stringify(data, null, 2);
};

export const restoreDatabaseBackup = (jsonData: string) => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.courses && Array.isArray(data.courses)) {
      mockCourses.length = 0;
      mockCourses.push(...data.courses);
    }
    if (data.empresas && Array.isArray(data.empresas)) {
      mockEmpresas.length = 0;
      mockEmpresas.push(...data.empresas);
    }
    if (data.formadores && Array.isArray(data.formadores)) {
      mockFormadores.length = 0;
      mockFormadores.push(...data.formadores);
    }
    if (data.alunos && Array.isArray(data.alunos)) {
      mockStudents.length = 0;
      mockStudents.push(...data.alunos);
    }
    if (data.notifications && Array.isArray(data.notifications)) {
      mockNotifications.length = 0;
      mockNotifications.push(...data.notifications);
    }
    if (data.companies && Array.isArray(data.companies)) {
      mockCompanies.length = 0;
      mockCompanies.push(...data.companies);
    }
    if (data.trainers && Array.isArray(data.trainers)) {
      mockTrainers.length = 0;
      mockTrainers.push(...data.trainers);
    }
    return true;
  } catch (error) {
    console.error("Error restoring backup:", error);
    return false;
  }
};

export const searchAlunos = async (filters: { searchTerm?: string, empresa?: string, nivel?: string }, limitCount = 50): Promise<Student[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = [...mockStudents];
      if (filters.searchTerm) {
        const lowerTerm = filters.searchTerm.toLowerCase();
        results = results.filter(s => 
          s.nome.toLowerCase().includes(lowerTerm) ||
          s.numeroAluno?.toLowerCase().includes(lowerTerm) ||
          s.email?.toLowerCase().includes(lowerTerm)
        );
      }
      if (filters.empresa) {
        results = results.filter(s => s.empresaId === filters.empresa);
      }
      if (filters.nivel) {
        results = results.filter(s => s.niveis?.includes(filters.nivel as any));
      }
      resolve(results.slice(0, limitCount));
    }, 400);
  });
};

export const searchArchivedCourses = async (filters: any, limitCount = 50): Promise<Course[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = [...mockCourses].filter(c => c.state === 'FEITO' || c.state === 'ANULADO' || c.state === 'CONCLUIDO');
      
      if (filters.searchTerm) {
        const lowerTerm = filters.searchTerm.toLowerCase();
        results = results.filter(c => 
          c.reference.toLowerCase().includes(lowerTerm) ||
          c.empresa?.toLowerCase().includes(lowerTerm) ||
          c.trainerName?.toLowerCase().includes(lowerTerm)
        );
      }
      if (filters.year) {
        results = results.filter(c => c.startDate.startsWith(filters.year));
      }
      if (filters.state) {
        results = results.filter(c => c.state === filters.state);
      }
      if (filters.language) {
        results = results.filter(c => c.language === filters.language);
      }
      if (filters.level) {
        results = results.filter(c => c.nivel.includes(filters.level));
      }
      
      resolve(results.slice(0, limitCount));
    }, 400);
  });
};

export const updateCourseHonorarios = async (courseId: string, honorarios: HonorarioFormador[]): Promise<Course> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockCourses.findIndex(c => c.id === courseId);
      if (index === -1) {
        return reject(new Error('Course not found'));
      }
      
      mockCourses[index] = {
        ...mockCourses[index],
        honorariosFormador: honorarios
      };
      
      const newLog = {
        id: `l${Date.now()}`,
        user: 'Sistema',
        timestamp: new Date().toISOString(),
        message: `[SISTEMA] Honorários do formador atualizados.`
      };
      mockCourses[index].logs = [...(mockCourses[index].logs || []), newLog];

      resolve({ ...mockCourses[index] });
    }, 400);
  });
};
