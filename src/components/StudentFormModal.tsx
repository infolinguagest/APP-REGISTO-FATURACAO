import React, { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { Student, Empresa, LANGUAGE_LEVELS, Lingua } from '../types';
import { addAluno, updateAluno, getEmpresas, getLinguas } from '../services/dbService';
import { useToast } from '../contexts/ToastContext';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdate: () => void;
}

export function StudentFormModal({ isOpen, onClose, student, onUpdate }: StudentFormModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Partial<Student>>({
    numeroAluno: '',
    nome: '',
    email: '',
    empresaId: '',
    niveis: [],
    nif: ''
  });
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [linguasList, setLinguasList] = useState<Lingua[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empresasData, linguasData] = await Promise.all([
          getEmpresas(),
          getLinguas()
        ]);
        setEmpresas(empresasData);
        setLinguasList(linguasData);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    
    if (isOpen) {
      fetchData();
      window.addEventListener('focus', fetchData);
    }
    
    return () => {
      window.removeEventListener('focus', fetchData);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (student) {
        setFormData({
          numeroAluno: student.numeroAluno || '',
          nome: student.nome,
          email: student.email,
          empresaId: student.empresaId || '',
          niveis: student.niveis || [],
          nif: student.nif || ''
        });
      } else {
        setFormData({
          numeroAluno: '',
          nome: '',
          email: '',
          empresaId: '',
          niveis: [],
          nif: ''
        });
      }
    }
    setSelectedLang('');
    setSelectedLevel('');
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

  if (!isOpen) return null;

  const selectedEmpresa = empresas.find(e => e.id === formData.empresaId);
  const showNifField = selectedEmpresa?.nome.toLowerCase() === 'linguagest' || selectedEmpresa?.isB2C;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Clean up NIF if not applicable
    const dataToSave = { ...formData };
    if (!showNifField) {
      delete (dataToSave as any).nif;
    }

    try {
      if (student) {
        await updateAluno(student.id, dataToSave);
        showToast('Aluno atualizado com sucesso!', 'success');
      } else {
        await addAluno(dataToSave as Omit<Student, 'id'>);
        showToast('Aluno criado com sucesso!', 'success');
      }
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to save student', error);
      showToast('Erro ao guardar aluno.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-xl shrink-0">
          <h2 className="text-xl font-bold text-slate-900">
            {student ? 'Editar Aluno' : 'Novo Aluno'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-2 hover:bg-slate-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          <form id="student-form" onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nº Aluno (Opcional)</label>
              <input
                type="text"
                value={formData.numeroAluno}
                onChange={(e) => setFormData({...formData, numeroAluno: e.target.value})}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Ex: A001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
              <select
                value={formData.empresaId}
                onChange={(e) => setFormData({...formData, empresaId: e.target.value})}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- Selecionar Empresa --</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nome}</option>
                ))}
              </select>
            </div>

            {showNifField && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-1">NIF</label>
                <input
                  type="text"
                  value={formData.nif}
                  onChange={(e) => setFormData({...formData, nif: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ex: 123456789"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Níveis de Língua</label>
              
              {(formData.niveis && formData.niveis.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.niveis.map((nivel, idx) => (
                    <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {nivel}
                      <button
                        type="button"
                        onClick={() => handleRemoveNivel(nivel)}
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
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
                  Adicionar
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="student-form"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
