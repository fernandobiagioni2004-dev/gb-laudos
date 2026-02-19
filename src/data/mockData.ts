export type Role = 'admin' | 'radiologista' | 'externo';

export type ExamStatus = 'Disponível' | 'Em análise' | 'Finalizado' | 'Cancelado';

export type Software = 'Axel' | 'Morita';

export interface Client {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  status: 'Ativo' | 'Inativo';
}

export type ExamCategory = 'radiografia' | 'tomografia';

export interface ExamType {
  id: string;
  name: string;
  category: ExamCategory;
}

export interface Radiologist {
  id: string;
  name: string;
  email: string;
  software: Software[];
  avatar?: string;
}

export interface PricingEntry {
  clientId: string;
  examTypeId: string;
  clientValue: number;
  radiologistValues: Record<string, number>; // radiologistId -> value
}

export interface StatusHistoryEntry {
  status: ExamStatus;
  date: string;
  by: string;
}

export interface Exam {
  id: string;
  clientId: string;
  patientName: string;
  patientBirthDate: string;
  examTypeId: string;
  examCategory: ExamCategory;
  software: Software;
  radiologistId: string | null;
  status: ExamStatus;
  clientValue: number;
  radiologistValue: number;
  margin: number;
  observations: string;
  createdAt: string;
  statusHistory: StatusHistoryEntry[];
  files: string[];
  urgent?: boolean;
  urgentDate?: string;
  urgentTime?: string;
}

// ─── Clients ─────────────────────────────────────────────────────────────────
export const clients: Client[] = [
  { id: 'c1', name: 'Clínica OralMax', cnpj: '12.345.678/0001-90', email: 'contato@oralmax.com.br', status: 'Ativo' },
  { id: 'c2', name: 'Centro de Imagem Dental', cnpj: '23.456.789/0001-01', email: 'admin@cidental.com.br', status: 'Ativo' },
  { id: 'c3', name: 'OdontoPrime', cnpj: '34.567.890/0001-12', email: 'info@odontoprime.com.br', status: 'Ativo' },
];

// ─── Exam Types ───────────────────────────────────────────────────────────────
export const examTypes: ExamType[] = [
  // Radiografia
  { id: 'et1', name: 'Panorâmica', category: 'radiografia' },
  { id: 'et3', name: 'Periapical', category: 'radiografia' },
  { id: 'et4', name: 'Telerradiografia', category: 'radiografia' },
  { id: 'et5', name: 'Interproximal (Bite-Wing)', category: 'radiografia' },
  // Tomografia
  { id: 'et2', name: 'Tomografia Computadorizada (TCFC)', category: 'tomografia' },
  { id: 'et6', name: 'Tomografia de ATM', category: 'tomografia' },
  { id: 'et7', name: 'Tomografia de Seios da Face', category: 'tomografia' },
];

// ─── Radiologists ─────────────────────────────────────────────────────────────
export const radiologists: Radiologist[] = [
  { id: 'r1', name: 'Dr. Carlos Menezes', email: 'carlos.menezes@laudos.com', software: ['Axel'] },
  { id: 'r2', name: 'Dra. Ana Ferreira', email: 'ana.ferreira@laudos.com', software: ['Axel'] },
  { id: 'r3', name: 'Dr. Ricardo Souza', email: 'ricardo.souza@laudos.com', software: ['Morita'] },
  { id: 'r4', name: 'Dra. Juliana Costa', email: 'juliana.costa@laudos.com', software: ['Morita'] },
];

// ─── Pricing Matrix ───────────────────────────────────────────────────────────
export const pricing: PricingEntry[] = [
  // OralMax
  { clientId: 'c1', examTypeId: 'et1', clientValue: 180, radiologistValues: { r1: 100, r2: 95, r3: 105, r4: 98 } },
  { clientId: 'c1', examTypeId: 'et2', clientValue: 350, radiologistValues: { r1: 180, r2: 175, r3: 185, r4: 178 } },
  { clientId: 'c1', examTypeId: 'et3', clientValue: 100, radiologistValues: { r1: 55, r2: 50, r3: 58, r4: 52 } },
  // CID
  { clientId: 'c2', examTypeId: 'et1', clientValue: 200, radiologistValues: { r1: 110, r2: 105, r3: 115, r4: 108 } },
  { clientId: 'c2', examTypeId: 'et2', clientValue: 400, radiologistValues: { r1: 200, r2: 195, r3: 205, r4: 198 } },
  { clientId: 'c2', examTypeId: 'et3', clientValue: 120, radiologistValues: { r1: 65, r2: 60, r3: 68, r4: 62 } },
  // OdontoPrime
  { clientId: 'c3', examTypeId: 'et1', clientValue: 160, radiologistValues: { r1: 90, r2: 85, r3: 95, r4: 88 } },
  { clientId: 'c3', examTypeId: 'et2', clientValue: 320, radiologistValues: { r1: 165, r2: 160, r3: 170, r4: 163 } },
  { clientId: 'c3', examTypeId: 'et3', clientValue: 90, radiologistValues: { r1: 48, r2: 45, r3: 50, r4: 46 } },
];

export function getPricing(clientId: string, examTypeId: string): PricingEntry | undefined {
  return pricing.find(p => p.clientId === clientId && p.examTypeId === examTypeId);
}

export function calcValues(clientId: string, examTypeId: string, radiologistId: string | null) {
  const entry = getPricing(clientId, examTypeId);
  const clientValue = entry?.clientValue ?? 0;
  const radiologistValue = (radiologistId && entry?.radiologistValues[radiologistId]) ? entry.radiologistValues[radiologistId] : 0;
  return { clientValue, radiologistValue, margin: clientValue - radiologistValue };
}

// ─── 20 Mock Exams ────────────────────────────────────────────────────────────
function makeExam(
  id: string,
  clientId: string,
  patientName: string,
  patientBirthDate: string,
  examTypeId: string,
  software: Software,
  radiologistId: string | null,
  status: ExamStatus,
  createdAt: string,
  observations = '',
): Exam {
  const { clientValue, radiologistValue, margin } = calcValues(clientId, examTypeId, radiologistId);
  const history: StatusHistoryEntry[] = [{ status: 'Disponível', date: createdAt, by: 'Sistema' }];
  if (status === 'Em análise' || status === 'Finalizado') {
    history.push({ status: 'Em análise', date: createdAt, by: radiologistId ? radiologists.find(r => r.id === radiologistId)?.name ?? 'Radiologista' : 'Radiologista' });
  }
  if (status === 'Finalizado') {
    history.push({ status: 'Finalizado', date: createdAt, by: radiologistId ? radiologists.find(r => r.id === radiologistId)?.name ?? 'Radiologista' : 'Radiologista' });
  }
  if (status === 'Cancelado') {
    history.push({ status: 'Cancelado', date: createdAt, by: 'Admin' });
  }
  const examCategory = examTypes.find(t => t.id === examTypeId)?.category ?? 'radiografia';
  return {
    id, clientId, patientName, patientBirthDate, examTypeId, examCategory, software, radiologistId, status,
    clientValue, radiologistValue, margin, observations, createdAt,
    statusHistory: history,
    files: status === 'Finalizado' ? ['laudo_' + id + '.pdf'] : [],
  };
}

// ─── Calendar Events ──────────────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  type: 'ferias' | 'reuniao';
  startDate: string;
  endDate: string;
  participants: string[];
  description: string;
  createdBy: string;
  time?: string;
  duration?: number;
}

export const initialCalendarEvents: CalendarEvent[] = [
  { id: 'ev1', title: 'Férias - Dr. Carlos Menezes', type: 'ferias', startDate: '2026-02-24', endDate: '2026-02-28', participants: ['r1'], description: 'Período de férias programadas', createdBy: 'admin' },
  { id: 'ev2', title: 'Férias - Dra. Juliana Costa', type: 'ferias', startDate: '2026-03-10', endDate: '2026-03-14', participants: ['r4'], description: 'Férias regulamentares', createdBy: 'admin' },
  { id: 'ev3', title: 'Reunião de alinhamento', type: 'reuniao', startDate: '2026-02-20', endDate: '2026-02-20', participants: ['admin', 'r1'], description: 'Alinhamento sobre novos processos de laudo', createdBy: 'admin', time: '14:00', duration: 60 },
  { id: 'ev4', title: 'Reunião de equipe Morita', type: 'reuniao', startDate: '2026-02-25', endDate: '2026-02-25', participants: ['admin', 'r3', 'r4'], description: 'Discussão sobre fluxo de exames Morita', createdBy: 'admin', time: '10:00', duration: 90 },
  { id: 'ev5', title: 'Reunião geral', type: 'reuniao', startDate: '2026-03-03', endDate: '2026-03-03', participants: ['admin', 'r1', 'r2', 'r3', 'r4'], description: 'Reunião mensal com toda a equipe', createdBy: 'admin', time: '09:00', duration: 120 },
  { id: 'ev6', title: 'Reunião Axel - qualidade', type: 'reuniao', startDate: '2026-02-21', endDate: '2026-02-21', participants: ['admin', 'r2'], description: 'Revisão de qualidade dos laudos Axel', createdBy: 'admin', time: '15:30', duration: 45 },
];

export const initialExams: Exam[] = [
  makeExam('EX001', 'c1', 'João Silva',        '1985-03-12', 'et1', 'Axel',   'r1', 'Finalizado',  '2026-02-01'),
  makeExam('EX002', 'c1', 'Maria Oliveira',    '1992-07-22', 'et2', 'Axel',   'r2', 'Finalizado',  '2026-02-02'),
  makeExam('EX003', 'c2', 'Carlos Pereira',    '1978-11-05', 'et3', 'Morita', 'r3', 'Finalizado',  '2026-02-03'),
  makeExam('EX004', 'c2', 'Ana Costa',         '2001-01-30', 'et1', 'Morita', 'r4', 'Finalizado',  '2026-02-04'),
  makeExam('EX005', 'c3', 'Pedro Rodrigues',   '1990-06-18', 'et2', 'Axel',   'r1', 'Finalizado',  '2026-02-05'),
  makeExam('EX006', 'c3', 'Fernanda Lima',     '1975-09-25', 'et3', 'Axel',   'r2', 'Finalizado',  '2026-02-06'),
  makeExam('EX007', 'c1', 'Ricardo Souza',     '1988-04-14', 'et1', 'Morita', 'r3', 'Finalizado',  '2026-02-07'),
  makeExam('EX008', 'c2', 'Juliana Mendes',    '1995-12-03', 'et2', 'Morita', 'r4', 'Finalizado',  '2026-02-08'),
  makeExam('EX009', 'c3', 'Lucas Ferreira',    '1983-08-27', 'et3', 'Axel',   'r1', 'Finalizado',  '2026-02-09'),
  makeExam('EX010', 'c1', 'Camila Alves',      '1998-02-16', 'et1', 'Axel',   'r2', 'Finalizado',  '2026-02-10'),
  makeExam('EX011', 'c2', 'Bruno Martins',     '1970-10-08', 'et2', 'Morita', 'r3', 'Em análise',  '2026-02-11'),
  makeExam('EX012', 'c3', 'Patrícia Santos',   '1987-05-20', 'et3', 'Morita', 'r4', 'Em análise',  '2026-02-12'),
  makeExam('EX013', 'c1', 'Eduardo Nunes',     '2000-03-07', 'et1', 'Axel',   'r1', 'Em análise',  '2026-02-13'),
  makeExam('EX014', 'c2', 'Larissa Carvalho',  '1993-07-11', 'et2', 'Axel',   'r2', 'Em análise',  '2026-02-14'),
  makeExam('EX015', 'c3', 'Marcos Ribeiro',    '1982-01-24', 'et3', 'Morita', null, 'Disponível',  '2026-02-15'),
  makeExam('EX016', 'c1', 'Isabela Gomes',     '1997-09-02', 'et1', 'Morita', null, 'Disponível',  '2026-02-16'),
  makeExam('EX017', 'c2', 'Felipe Araújo',     '1976-06-29', 'et2', 'Axel',   null, 'Disponível',  '2026-02-17'),
  makeExam('EX018', 'c3', 'Vanessa Correia',   '2003-04-15', 'et3', 'Axel',   null, 'Disponível',  '2026-02-17'),
  makeExam('EX019', 'c1', 'Rafael Baptista',   '1991-11-18', 'et1', 'Morita', null, 'Disponível',  '2026-02-18'),
  makeExam('EX020', 'c2', 'Daniela Fonseca',   '1984-08-04', 'et2', 'Morita', null, 'Cancelado',   '2026-02-10', 'Paciente desmarcou'),
];
