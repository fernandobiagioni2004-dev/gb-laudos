import React, { createContext, useContext, useState, useCallback } from 'react';
import { Role, Exam, initialExams, calcValues } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

interface AppContextValue {
  role: Role;
  setRole: (role: Role) => void;
  switching: boolean;
  exams: Exam[];
  addExam: (exam: Exam) => void;
  updateExamStatus: (examId: string, status: Exam['status'], radiologistId?: string) => void;
  assumeExam: (examId: string, radiologistId: string) => void;
  finalizeExam: (examId: string) => void;
  cancelExam: (examId: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('admin');
  const [switching, setSwitching] = useState(false);
  const [exams, setExams] = useState<Exam[]>(initialExams);

  const setRole = useCallback((newRole: Role) => {
    setSwitching(true);
    setTimeout(() => {
      setRoleState(newRole);
      setSwitching(false);
    }, 700);
  }, []);

  const addExam = useCallback((exam: Exam) => {
    setExams(prev => [exam, ...prev]);
  }, []);

  const updateExamStatus = useCallback((examId: string, status: Exam['status'], radiologistId?: string) => {
    setExams(prev => prev.map(e => {
      if (e.id !== examId) return e;
      const now = new Date().toISOString().split('T')[0];
      const newHistory = [...e.statusHistory, { status, date: now, by: 'Sistema' }];
      const newRadId = radiologistId !== undefined ? radiologistId : e.radiologistId;
      const { clientValue, radiologistValue, margin } = calcValues(e.clientId, e.examTypeId, newRadId);
      return {
        ...e,
        status,
        radiologistId: newRadId,
        clientValue,
        radiologistValue,
        margin,
        statusHistory: newHistory,
        files: status === 'Finalizado' ? [`laudo_${e.id}.pdf`] : e.files,
      };
    }));
  }, []);

  const assumeExam = useCallback((examId: string, radiologistId: string) => {
    const now = new Date().toISOString().split('T')[0];
    setExams(prev => prev.map(e => {
      if (e.id !== examId) return e;
      const { clientValue, radiologistValue, margin } = calcValues(e.clientId, e.examTypeId, radiologistId);
      return {
        ...e,
        status: 'Em análise',
        radiologistId,
        clientValue,
        radiologistValue,
        margin,
        statusHistory: [...e.statusHistory, { status: 'Em análise', date: now, by: 'Radiologista' }],
      };
    }));
    toast({ title: '✅ Exame assumido!', description: `Exame ${examId} agora está em análise.` });
  }, []);

  const finalizeExam = useCallback((examId: string) => {
    const now = new Date().toISOString().split('T')[0];
    setExams(prev => prev.map(e => {
      if (e.id !== examId) return e;
      return {
        ...e,
        status: 'Finalizado',
        statusHistory: [...e.statusHistory, { status: 'Finalizado', date: now, by: 'Radiologista' }],
        files: [...e.files, `laudo_${e.id}.pdf`],
      };
    }));
    toast({ title: '🎉 Exame finalizado!', description: `Laudo do exame ${examId} enviado com sucesso.` });
  }, []);

  const cancelExam = useCallback((examId: string) => {
    const now = new Date().toISOString().split('T')[0];
    setExams(prev => prev.map(e => {
      if (e.id !== examId) return e;
      return {
        ...e,
        status: 'Cancelado',
        statusHistory: [...e.statusHistory, { status: 'Cancelado', date: now, by: 'Admin' }],
      };
    }));
    toast({ title: 'Exame cancelado', description: `Exame ${examId} foi cancelado.`, variant: 'destructive' });
  }, []);

  return (
    <AppContext.Provider value={{ role, setRole, switching, exams, addExam, updateExamStatus, assumeExam, finalizeExam, cancelExam }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
