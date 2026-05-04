import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Course, Company, Trainer, Formador, Empresa, DRH, LANGUAGE_LEVELS, Lingua } from '../types';
import { mockFormadores, mockEmpresas, getLinguas } from '../services/dbService';
import { useToast } from '../contexts/ToastContext';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseData: Omit<Course, 'id' | 'state'>) => Promise<void>;
  courses: Course[];
  initialData?: Partial<Course>;
}

const LOCALS = [
  { id: 'Teams', type: 'V' },
  { id: 'Zoom', type: 'V' },
  { id: 'Sala Virtual Moodle', type: 'V' },
  { id: 'Recurso Formador', type: 'V' },
  { id: 'Presencial Linguagest', type: 'P' },
  { id: 'Presencial Cliente', type: 'P' }
];

const COORDINATORS = ['Isabella Zanutta', 'Elena Puentes'];

const INITIAL_FORM_DATA = {
  reference: '',
  language: '',
  nivel1: '',
  nivel2: '',
  local: '',
  audience: '',
  coordenadora: '',
  empresaId: '',
  empresa: '',
  drhNome: '',
  drhEmail: '',
  startDate: '',
  expectedEndDate: '',
  structure: '',
  descricaoFormacao: '',
  schedule: '',
  isFlexibleSchedule: false,
  formadorId: '',
  formador: '',
  trainerCost: '' as number | '',
  hasTutoring: false,
  valorTutoria: '' as number | '',
  descricaoTutoria: '',
  dtpLink: '',
  requiresSigo: false,
  sigoId: '',
  isContinuation: false,
  previousCourseRef: '',
  inheritedStudents: [] as string[],
  horasFormador: '' as number | '',
  horasPlataforma: '' as number | '',
  recursos: '',
  observacoes: '',
  modalidade: '',
  dataConclusaoEfetiva: '',
  dataEmissaoCertificados: '',
  dataEnvioRH: '',
};

export function CourseFormModal({ isOpen, onClose, onSubmit, courses, initialData }: CourseFormModalProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData?.id;
  const [linguasList, setLinguasList] = useState<Lingua[]>([]);
  const [isManualRef, setIsManualRef] = useState(false);

  useEffect(() => {
    const fetchLangs = () => {
      getLinguas().then(setLinguasList).catch(console.error);
    };
    
    if (isOpen) {
      fetchLangs();
      window.addEventListener('focus', fetchLangs);
    }
    
    return () => {
      window.removeEventListener('focus', fetchLangs);
    };
  }, [isOpen]);

  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Fetch mock data and reset form when opened
  useEffect(() => {
    if (isOpen && linguasList.length > 0) {
      setIsManualRef(false);
      if (initialData) {
        const foundLang = linguasList.find(l => l.name === initialData.language || l.code === initialData.language);
        
        let n1 = '';
        let n2 = '';
        if (initialData.nivel) {
          const parts = initialData.nivel.split(' - ');
          n1 = parts[0] || '';
          n2 = parts[1] || '';
        }

        // Helper to format date strings to YYYY-MM-DD for input type="date"
        const formatDateForInput = (dateStr?: string) => {
          if (!dateStr) return '';
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            const [day, month, year] = dateStr.split('/');
            return `${year}-${month}-${day}`;
          }
          return dateStr;
        };

        setFormData({
          reference: initialData.reference || '',
          language: foundLang ? foundLang.code : (initialData.language || ''),
          nivel1: n1,
          nivel2: n2,
          local: initialData.local || '',
          audience: initialData.audience || '',
          coordenadora: initialData.coordenadora || '',
          empresaId: initialData.empresaId || initialData.companyId || '',
          empresa: initialData.empresa || '',
          drhNome: initialData.drhNome || initialData.hrContact || '',
          drhEmail: initialData.drhEmail || '',
          startDate: formatDateForInput(initialData.startDate),
          expectedEndDate: formatDateForInput(initialData.expectedEndDate),
          structure: initialData.structure || '',
          descricaoFormacao: initialData.descricaoFormacao || '',
          schedule: initialData.schedule || '',
          isFlexibleSchedule: initialData.isFlexibleSchedule || false,
          formadorId: initialData.formadorId || initialData.trainerId || '',
          formador: initialData.trainerName || '',
          trainerCost: initialData.trainerCost || '',
          hasTutoring: initialData.hasTutoring || false,
          valorTutoria: initialData.valorTutoria || '',
          descricaoTutoria: initialData.descricaoTutoria || '',
          dtpLink: initialData.dtpLink || '',
          requiresSigo: initialData.requiresSigo || false,
          sigoId: initialData.sigoId || '',
          isContinuation: !!initialData.previousCourseRef,
          previousCourseRef: initialData.previousCourseRef || '',
          inheritedStudents: initialData.enrolledStudents || [],
          horasFormador: initialData.horasFormador || '',
          horasPlataforma: initialData.horasPlataforma || '',
          recursos: initialData.recursos || '',
          observacoes: initialData.observacoes || '',
          modalidade: initialData.modalidade || '',
          dataConclusaoEfetiva: formatDateForInput(initialData.dataConclusaoEfetiva),
          dataEmissaoCertificados: formatDateForInput(initialData.dataEmissaoCertificados),
          dataEnvioRH: formatDateForInput(initialData.dataEnvioRH),
        });
      } else {
        setFormData(INITIAL_FORM_DATA);
      }
      setIsSubmitting(false);
    }
  }, [isOpen, initialData, linguasList]);

  // Handle Flexible Schedule
  useEffect(() => {
    if (formData.isFlexibleSchedule) {
      setFormData(prev => ({ ...prev, schedule: 'Flexível' }));
    } else if (formData.schedule === 'Flexível') {
      setFormData(prev => ({ ...prev, schedule: '' }));
    }
  }, [formData.isFlexibleSchedule]);

  // Handle Audience change
  useEffect(() => {
    if (formData.audience === 'C') {
      const linguagest = mockEmpresas.find(e => e.isB2C);
      if (linguagest) {
        setFormData(prev => ({
          ...prev,
          empresaId: linguagest.id,
          empresa: linguagest.nome,
          drhNome: '',
          drhEmail: ''
        }));
      } else {
        setFormData(prev => ({ ...prev, drhNome: '', drhEmail: '' }));
      }
    } else if (formData.audience === 'B' && formData.empresaId === 'emp_linguagest') {
      setFormData(prev => ({
        ...prev,
        empresaId: '',
        empresa: '',
        drhNome: '',
        drhEmail: ''
      }));
    }
  }, [formData.audience]);

  // Calculate Reference Preview
  const maxSeq = courses.reduce((max, course) => {
    const match = course.reference.match(/^(\d+)\//);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  
  const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
  const year = new Date().getFullYear().toString().slice(-2);
  const langCode = formData.language || 'XXX';
  const selectedLocalObj = LOCALS.find(l => l.id === formData.local);
  const modCode = selectedLocalObj ? selectedLocalObj.type : 'X';
  const audCode = formData.audience === 'C' ? 'L' : (formData.audience || 'X');
  const referencePreview = isEditing ? initialData?.reference || '' : `${nextSeq}/${year}-${langCode}-${modCode}-${audCode}`;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const nivelFinal = formData.nivel2 ? `${formData.nivel1} - ${formData.nivel2}` : formData.nivel1;

    const courseData: Omit<Course, 'id' | 'state'> = {
      reference: (isManualRef && formData.reference) ? formData.reference : referencePreview,
      language: formData.language,
      startDate: formData.startDate,
      expectedEndDate: formData.expectedEndDate,
      coordenadora: formData.coordenadora,
      local: formData.local,
      nivel: nivelFinal,
      audience: formData.audience,
      companyId: formData.empresaId,
      empresa: formData.empresa,
      hrContact: formData.drhNome,
      empresaId: formData.empresaId,
      drhNome: formData.drhNome,
      drhEmail: formData.drhEmail,
      structure: formData.structure,
      descricaoFormacao: formData.descricaoFormacao,
      schedule: formData.schedule,
      isFlexibleSchedule: formData.isFlexibleSchedule,
      trainerId: formData.formadorId,
      trainerName: formData.formador,
      formadorId: formData.formadorId,
      trainerCost: Number(formData.trainerCost),
      horasFormador: formData.horasFormador !== '' ? Number(formData.horasFormador) : undefined,
      horasPlataforma: formData.horasPlataforma !== '' ? Number(formData.horasPlataforma) : undefined,
      hasTutoring: formData.hasTutoring,
      valorTutoria: formData.hasTutoring && formData.valorTutoria !== '' ? Number(formData.valorTutoria) : undefined,
      descricaoTutoria: formData.hasTutoring ? formData.descricaoTutoria : undefined,
      dtpLink: formData.dtpLink || null,
      requiresSigo: formData.requiresSigo,
      sigoId: formData.requiresSigo ? formData.sigoId : undefined,
      previousCourseRef: formData.isContinuation ? formData.previousCourseRef : undefined,
      enrolledStudents: formData.inheritedStudents.length > 0 ? formData.inheritedStudents : undefined,
      recursos: formData.recursos,
      observacoes: formData.observacoes,
      modalidade: formData.modalidade,
      dataConclusaoEfetiva: formData.dataConclusaoEfetiva,
      dataEmissaoCertificados: formData.dataEmissaoCertificados,
      dataEnvioRH: formData.dataEnvioRH,
    };

    try {
      await onSubmit(courseData);
      showToast(isEditing ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!', 'success');
      onClose();
    } catch (error) {
      console.error('Error creating course:', error);
      showToast('Ocorreu um erro ao guardar o curso.', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
          <h2 className="text-xl font-semibold text-slate-900">{isEditing ? 'Editar Curso' : 'Novo Curso'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content */}
        <form id="course-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Reference Preview */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-4">
                <label className="block text-xs font-medium text-indigo-600 uppercase tracking-wider mb-1">
                  {isEditing && !isManualRef ? 'Referência do Curso' : 'Preview da Referência'}
                </label>
                {!isManualRef ? (
                  <div className="text-xl font-mono font-bold text-indigo-900">{referencePreview}</div>
                ) : (
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    placeholder="Ex: 001/26-ING-V-B"
                    className="w-full max-w-sm rounded-md border border-indigo-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                )}
              </div>
              <div className="text-sm text-indigo-600/80 italic shrink-0 mt-1">
                {isManualRef ? 'Edição Manual' : (isEditing ? 'Referência' : 'Gerado automaticamente')}
              </div>
            </div>
            
            <div className="flex items-center pt-3 border-t border-indigo-100 mt-1">
              <label className="flex items-center text-sm text-indigo-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isManualRef}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsManualRef(checked);
                    if (checked) {
                      setFormData(prev => ({ ...prev, reference: referencePreview }));
                    }
                  }}
                  className="mr-2 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                />
                Definir Referência Manualmente
              </label>
            </div>
          </div>

          {/* Section 1: Classificação */}
          <section>
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-200 pb-2">1. Classificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Língua *</label>
                <select required name="language" value={formData.language} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="" disabled>-- Selecionar opção --</option>
                  {linguasList.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name} {lang.code !== lang.name ? `(${lang.code})` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nível (Intervalo) *</label>
                <div className="flex items-center gap-2">
                  <select required name="nivel1" value={formData.nivel1} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="" disabled>Início</option>
                    {LANGUAGE_LEVELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <span className="text-slate-500">-</span>
                  <select name="nivel2" value={formData.nivel2} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="">Fim (Opcional)</option>
                    {LANGUAGE_LEVELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Local *</label>
                <select required name="local" value={formData.local} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="" disabled>-- Selecionar opção --</option>
                  {LOCALS.map(l => (
                    <option key={l.id} value={l.id}>{l.id}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Público *</label>
                <select required name="audience" value={formData.audience} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="" disabled>-- Selecionar opção --</option>
                  <option value="B">Business (B2B)</option>
                  <option value="C">Linguagest</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Coordenadora *</label>
                <select required name="coordenadora" value={formData.coordenadora} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="" disabled>-- Selecionar opção --</option>
                  {COORDINATORS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Modalidade</label>
                <input type="text" name="modalidade" value={formData.modalidade} onChange={handleChange} placeholder="Ex: Corp. Online" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
            </div>
          </section>

          {/* Section 2: Cliente / Empresa */}
          <section>
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-200 pb-2">2. Cliente / Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Empresa *</label>
                <select 
                  required 
                  name="empresaId"
                  value={formData.empresaId} 
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedEmpresa = mockEmpresas.find(emp => emp.id === selectedId);
                    if (selectedEmpresa) {
                      setFormData(prev => {
                        const newData = {
                          ...prev,
                          empresaId: selectedEmpresa.id,
                          empresa: selectedEmpresa.nome,
                          audience: selectedEmpresa.isB2C ? 'C' : 'B',
                          drhNome: '',
                          drhEmail: ''
                        };
                        if (!selectedEmpresa.isB2C && selectedEmpresa.drhs && selectedEmpresa.drhs.length === 1) {
                          newData.drhNome = selectedEmpresa.drhs[0].nome;
                          newData.drhEmail = selectedEmpresa.drhs[0].email;
                        }
                        return newData;
                      });
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        empresaId: '',
                        empresa: '',
                        drhNome: '',
                        drhEmail: ''
                      }));
                    }
                  }} 
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" disabled>-- Selecionar empresa --</option>
                  {mockEmpresas.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {formData.empresaId && (() => {
                const selectedEmpresa = mockEmpresas.find(e => e.id === formData.empresaId);
                if (selectedEmpresa && !selectedEmpresa.isB2C && selectedEmpresa.drhs && selectedEmpresa.drhs.length > 0) {
                  return (
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">DRH / Contacto RH *</label>
                      <select 
                        required 
                        name="drhNome"
                        value={formData.drhNome} 
                        onChange={(e) => {
                          const selectedName = e.target.value;
                          const selectedDrh = selectedEmpresa.drhs.find(d => d.nome === selectedName);
                          if (selectedDrh) {
                            setFormData(prev => ({
                              ...prev,
                              drhNome: selectedDrh.nome,
                              drhEmail: selectedDrh.email
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              drhNome: '',
                              drhEmail: ''
                            }));
                          }
                        }} 
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="" disabled>-- Selecionar DRH --</option>
                        {selectedEmpresa.drhs.map(drh => (
                          <option key={drh.id} value={drh.nome}>{drh.nome}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </section>

          {/* Section 3: Planeamento */}
          <section>
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-200 pb-2">3. Planeamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início *</label>
                <input type="date" required name="startDate" value={formData.startDate} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Conclusão Prevista *</label>
                <input type="date" required name="expectedEndDate" value={formData.expectedEndDate} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1 lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição da Formação</label>
                <textarea rows={2} name="descricaoFormacao" value={formData.descricaoFormacao} onChange={handleChange} placeholder="Breve descrição dos objetivos ou conteúdo do curso..." className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1 lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Estrutura do Curso *</label>
                <textarea required rows={2} name="structure" value={formData.structure} onChange={handleChange} placeholder="Ex: 28 aulas de 1,5h + teste" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1">
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-medium text-slate-700">Dias e Horário *</label>
                  <label className="flex items-center text-xs text-slate-600 cursor-pointer">
                    <input type="checkbox" name="isFlexibleSchedule" checked={formData.isFlexibleSchedule} onChange={handleChange} className="mr-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    Horário Flexível
                  </label>
                </div>
                <input type="text" required disabled={formData.isFlexibleSchedule} name="schedule" value={formData.schedule} onChange={handleChange} placeholder="Ex: Seg e Qua 18h-19h30" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Horas c/ Formador *</label>
                <input type="number" min="0" step="0.5" required name="horasFormador" value={formData.horasFormador} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Horas na Plataforma</label>
                <input type="number" min="0" step="0.5" name="horasPlataforma" value={formData.horasPlataforma} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Conclusão Efetiva</label>
                <input type="date" name="dataConclusaoEfetiva" value={formData.dataConclusaoEfetiva} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Emissão (Linguagest)</label>
                <input type="date" name="dataEmissaoCertificados" value={formData.dataEmissaoCertificados} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Envio ao RH</label>
                <input type="date" name="dataEnvioRH" value={formData.dataEnvioRH} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
            </div>
          </section>

          {/* Section 4: Formador & Custos */}
          <section>
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-200 pb-2">4. Formador & Custos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Formador *</label>
                <select 
                  required 
                  name="formadorId"
                  value={formData.formadorId} 
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedFormador = mockFormadores.find(f => f.id === selectedId);
                    if (selectedFormador) {
                      setFormData(prev => ({
                        ...prev,
                        formadorId: selectedFormador.id,
                        formador: selectedFormador.nome
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        formadorId: '',
                        formador: ''
                      }));
                    }
                  }} 
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" disabled>-- Selecionar formador --</option>
                  {mockFormadores.map(t => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Custo Formador (€/hora) *</label>
                <input type="number" min="0" step="0.01" required name="trainerCost" value={formData.trainerCost} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>

              <div className="col-span-1 lg:col-span-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="flex items-center cursor-pointer mb-3">
                  <input type="checkbox" className="sr-only peer" name="hasTutoring" checked={formData.hasTutoring} onChange={handleChange} />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 relative"></div>
                  <span className="ml-3 text-sm font-medium text-slate-700">Terá Tutoria?</span>
                </label>
                {formData.hasTutoring && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total Tutoria (€) *</label>
                      <input type="number" min="0" step="0.01" required name="valorTutoria" value={formData.valorTutoria} onChange={handleChange} placeholder="Ex: 50" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Descrição / Formato de Pagamento *</label>
                      <textarea required rows={2} name="descricaoTutoria" value={formData.descricaoTutoria} onChange={handleChange} placeholder="Descreva como será processado o pagamento..." className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 5: Outros Detalhes */}
          <section>
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-200 pb-2">5. Outros Detalhes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1 lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Link DTP (Drive) <span className="text-slate-400 font-normal">(Opcional)</span></label>
                <input type="url" name="dtpLink" value={formData.dtpLink} onChange={handleChange} placeholder="https://..." className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>

              <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Recursos</label>
                  <textarea rows={3} name="recursos" value={formData.recursos} onChange={handleChange} placeholder="Recursos utilizados..." className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                  <textarea rows={3} name="observacoes" value={formData.observacoes} onChange={handleChange} placeholder="Observações adicionais..." className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* SIGO */}
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" name="requiresSigo" checked={formData.requiresSigo} onChange={handleChange} />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 relative"></div>
                    <span className="ml-3 text-sm font-medium text-slate-700">Requer Certificado SIGO?</span>
                  </label>
                  {formData.requiresSigo && (
                    <div className="mt-3 ml-12">
                      <input type="text" name="sigoId" value={formData.sigoId} onChange={handleChange} placeholder="ID SIGO" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                  )}
                </div>

                {/* Continuação */}
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" name="isContinuation" checked={formData.isContinuation} onChange={handleChange} />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 relative"></div>
                    <span className="ml-3 text-sm font-medium text-slate-700">É continuação de um curso?</span>
                  </label>
                  {formData.isContinuation && (
                    <div className="mt-3 ml-12">
                      <input type="text" required name="previousCourseRef" value={formData.previousCourseRef} onChange={handleChange} placeholder="Referência do Curso Anterior" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="course-form"
            disabled={isSubmitting}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                A Guardar...
              </>
            ) : (
              isEditing ? 'Guardar Alterações' : 'Criar Curso'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
