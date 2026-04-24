import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, GraduationCap, Calendar, BookOpen, Trash2, Plus } from 'lucide-react';
import { Student, Course, LANGUAGE_LEVELS, Lingua } from '../types';
import { updateStudent, getStudentCourseHistory, getLinguas } from '../services/dbService';
import { Badge } from './Badge';
import { formatDate } from '../utils/dateUtils';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdate: () => void;
}

export function StudentProfileModal({ isOpen, onClose, student, onUpdate }: StudentProfileModalProps) {
  const [formData, setFormData] = useState<Partial<Student>>({
    nome: '',
    email: '',
    niveis: []
  });
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [courseHistory, setCourseHistory] = useState<Course[]>([]);
  const [linguasList, setLinguasList] = useState<Lingua[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const linguasData = await getLinguas();
        setLinguasList(linguasData);
      } catch (error) {
        console.error('Failed to fetch linguas', error);
      }
    };
    
    if (isOpen && student) {
      setFormData({
        nome: student.nome,
        email: student.email,
        niveis: student.niveis || []
      });
      fetchHistory(student.id);
      fetchData();
      window.addEventListener('focus', fetchData);
    }
    setSelectedLang('');
    setSelectedLevel('');
    
    return () => {
      window.removeEventListener('focus', fetchData);
    };
  }, [isOpen, student]);

  const handleAddNivel = () => {
    if (!selectedLang || !selectedLevel) return;
    const newNivel = `${selectedLang}:${selectedLevel}`;
    const currentNiveis = formData.niveis || [];
    const filteredNiveis = currentNiveis.filter(n => !n.startsWith(`${selectedLang}:`));
    setFormData({
      ...formData,
      niveis: [...filteredNiveis, newNivel]
    });
    setSelectedLang('');
    setSelectedLevel('');
  };

  const handleRemoveNivel = (nivelToRemove: string) => {
    const currentNiveis = formData.niveis || [];
    setFormData({
      ...formData,
      niveis: currentNiveis.filter(n => n !== nivelToRemove)
    });
  };

  const fetchHistory = async (studentId: string) => {
    setIsLoadingHistory(true);
    try {
      const history = await getStudentCourseHistory(studentId);
      setCourseHistory(history);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (!isOpen || !student) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateStudent(student.id, formData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update student', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-xl shrink-0">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {student.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{student.nome}</h2>
              <div className="text-sm text-slate-500 font-mono">Nº {student.numeroAluno}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-2 hover:bg-slate-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content - 2 Columns */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Column: Data & Evolution */}
          <div className="w-full md:w-1/2 border-r border-slate-200 overflow-y-auto p-6 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Dados e Evolução</h3>
            
            <form onSubmit={handleSave} className="space-y-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2 text-indigo-500" />
                  Níveis de Língua
                </h4>
                
                <div className="space-y-4">
                  {(formData.niveis && formData.niveis.length > 0) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.niveis.map((nivel, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {nivel}
                          <button
                            type="button"
                            onClick={() => handleRemoveNivel(nivel)}
                            className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-600 focus:outline-none"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Língua</label>
                      <select
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Selecione...</option>
                        {linguasList.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Nível</label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Selecione...</option>
                        {LANGUAGE_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNivel}
                      disabled={!selectedLang || !selectedLevel}
                      className="px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-600 hover:bg-slate-700 focus:outline-none disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Course History */}
          <div className="w-full md:w-1/2 flex flex-col bg-white">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Histórico de Cursos</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              {isLoadingHistory ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                </div>
              ) : courseHistory.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-8 bg-white rounded-xl border border-slate-200 border-dashed">
                  Nenhum curso no histórico.
                </div>
              ) : (
                <div className="space-y-3">
                  {courseHistory.map(course => (
                    <div key={course.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-mono text-sm font-bold text-indigo-600">{course.reference}</div>
                        <Badge state={course.state} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        <div>
                          <span className="text-slate-500 text-xs uppercase block mb-0.5">Língua / Tipo</span>
                          <span className="font-medium text-slate-900">
                            {course.language || 
                             linguasList.find(l => course.reference.includes(l.code))?.name || 
                             'Outra'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs uppercase block mb-0.5">Data de Início</span>
                          <span className="font-medium text-slate-900">{formatDate(course.startDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
