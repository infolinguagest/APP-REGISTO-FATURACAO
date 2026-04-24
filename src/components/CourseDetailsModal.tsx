import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, Users, FileText } from 'lucide-react';
import { Course, CourseState, Student, Role } from '../types';
import { Badge } from './Badge';
import { updateCourseStatus, addCourseLog, getStudents, createManualNotification, updateCourseDetails, mockFormadores } from '../services/dbService';
import { CourseSummaryTab } from './CourseTabs/CourseSummaryTab';
import { CourseStudentsTab } from './CourseTabs/CourseStudentsTab';
import { CourseBillingTab } from './CourseTabs/CourseBillingTab';
import { useToast } from '../contexts/ToastContext';

interface CourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onUpdate: () => void;
  onOpenCourseByRef?: (reference: string) => void;
  onEditCourse?: (course: Course) => void;
}

const COURSE_STATES: CourseState[] = [
  'PENDENTE',
  'DTP CONCLUIDO',
  'FEITO',
  'A DECORRER',
  'EM VALIDAÇÃO',
  'VALIDADO',
  'CERTIFICADO LINGUAGEST',
  'CERTIFICADOS ENVIADOS RH',
  'CONCLUIDO',
  'ANULADO'
];

export function CourseDetailsModal({ isOpen, onClose, course, onUpdate, onOpenCourseByRef, onEditCourse }: CourseDetailsModalProps) {
  const { showToast } = useToast();
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedTargetRole, setSelectedTargetRole] = useState<Role | 'NINGUEM'>('NINGUEM');
  
  // Tabs & Students State
  const [activeTab, setActiveTab] = useState<'resumo' | 'alunos' | 'admin'>('resumo');
  const [students, setStudents] = useState<Student[]>([]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Sync local state with prop
  useEffect(() => {
    if (isOpen && course) {
      setCurrentCourse(course);
      fetchStudents();
    } else {
      setActiveTab('resumo');
    }
  }, [isOpen, course]);

  const fetchStudents = async () => {
    const data = await getStudents();
    setStudents(data);
  };

  // Scroll to bottom of logs when new logs arrive
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentCourse?.logs]);

  if (!isOpen || !currentCourse) return null;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value as CourseState;
    setIsUpdatingStatus(true);
    try {
      // Hardcoded user for now, would come from Auth context
      const updatedCourse = await updateCourseStatus(currentCourse.id, newState, 'Catarina Gomes');
      setCurrentCourse(updatedCourse);
      onUpdate(); // Refresh parent list
      showToast('Estado atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to update status', error);
      showToast('Erro ao atualizar estado.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentCourse) return;
    
    setIsSendingMessage(true);
    try {
      // Hardcoded user for now, would come from Auth context
      const updatedCourse = await addCourseLog(currentCourse.id, newMessage.trim(), 'Catarina Gomes');
      
      if (selectedTargetRole !== 'NINGUEM') {
        await createManualNotification(
          currentCourse.id,
          currentCourse.reference,
          newMessage.trim(),
          [selectedTargetRole as Role]
        );
      }
      
      setCurrentCourse(updatedCourse);
      setNewMessage('');
      setSelectedTargetRole('NINGUEM');
      onUpdate(); // Refresh parent list (optional, but good for consistency)
      showToast('Mensagem enviada com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to send message', error);
      showToast('Erro ao enviar mensagem.', 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-xl shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-slate-900 font-mono">{currentCourse.reference}</h2>
            <Badge state={currentCourse.state} />
            {isUpdatingStatus && <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-2 hover:bg-slate-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content - 2 Columns */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Column: Info & Management */}
          <div className="w-full md:w-1/2 lg:w-2/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
            
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 bg-white px-6 shrink-0">
              <button
                onClick={() => setActiveTab('resumo')}
                className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'resumo'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Resumo
              </button>
              <button
                onClick={() => setActiveTab('alunos')}
                className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center ${
                  activeTab === 'alunos'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                Alunos Inscritos
                <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
                  {currentCourse.enrolledStudents?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center ${
                  activeTab === 'admin'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Faturação
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'resumo' ? (
                <CourseSummaryTab
                  currentCourse={currentCourse}
                  isUpdatingStatus={isUpdatingStatus}
                  COURSE_STATES={COURSE_STATES}
                  handleStatusChange={handleStatusChange}
                  onEditCourse={onEditCourse}
                  onOpenCourseByRef={onOpenCourseByRef}
                />
              ) : activeTab === 'alunos' ? (
                <CourseStudentsTab
                  currentCourse={currentCourse}
                  students={students}
                  setCurrentCourse={setCurrentCourse}
                  onUpdate={onUpdate}
                />
              ) : activeTab === 'admin' ? (
                <CourseBillingTab
                  currentCourse={currentCourse}
                  onUpdate={onUpdate}
                  setCurrentCourse={setCurrentCourse}
                />
              ) : null}
            </div>
          </div>

          {/* Right Column: Feed & Communication */}
          <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col bg-white">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Histórico & Comunicação</h3>
            </div>
            
            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {(!currentCourse.logs || currentCourse.logs.length === 0) ? (
                <div className="text-center text-slate-500 text-sm py-8">
                  Sem histórico registado.
                </div>
              ) : (
                currentCourse.logs.map((log) => (
                  <div key={log.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-xs">
                        {log.user === 'Sistema' ? 'SYS' : log.user.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                    </div>
                    <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${log.user === 'Sistema' ? 'text-indigo-600' : 'text-slate-900'}`}>
                          {log.user}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDateTime(log.timestamp)}
                        </span>
                      </div>
                      <p className={`text-sm ${log.user === 'Sistema' ? 'text-slate-600 italic' : 'text-slate-700'}`}>
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 bg-white shrink-0">
              <div className="flex justify-end mb-2">
                <select
                  value={selectedTargetRole}
                  onChange={(e) => setSelectedTargetRole(e.target.value as Role | 'NINGUEM')}
                  className="text-xs border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1 pl-2 pr-6 bg-white text-slate-600 font-medium"
                >
                  <option value="NINGUEM">Notificar: Ninguém</option>
                  <option value="TODOS">Notificar: Todos</option>
                  <option value="COORDENACAO">Notificar: Coordenação</option>
                  <option value="ADMINISTRATIVO">Notificar: Administrativo</option>
                  <option value="SUPORTE">Notificar: Suporte</option>
                </select>
              </div>
              <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Adicionar uma nota ou observação..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSendingMessage}
                  className="inline-flex items-center justify-center p-2.5 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed h-[42px] w-[42px] shrink-0"
                >
                  {isSendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
              <div className="mt-2 text-[10px] text-slate-400 text-right">
                Pressione Enter para enviar (Shift+Enter para nova linha)
              </div>
            </div>
          </div>

        </div>
      </div>


    </div>
  );
}
