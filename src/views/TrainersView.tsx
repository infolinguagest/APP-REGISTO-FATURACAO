import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, AlertTriangle, Check, Eye } from 'lucide-react';
import { Formador, Lingua } from '../types';
import { getFormadores, addFormador, updateFormador, deleteFormador, getLinguas } from '../services/dbService';

const INITIAL_FORM_DATA: Omit<Formador, 'id'> = {
  nome: '',
  email: '',
  telefone: '',
  nif: '',
  iban: '',
  linguas: [],
  estado: 'Candidato',
  dataEnvioCv: '',
  dataPrimeiraEntrevista: '',
  observacoes: '',
  disponibilidadeHorario: '',
  modalidadeAula: 'Online',
  custoHoraBase: undefined,
  inicioColaboracao: ''
};

const ESTADOS: Formador['estado'][] = ['Candidato', 'Entrevista OK', 'Ativo', 'Inativo'];
const MODALIDADES: Formador['modalidadeAula'][] = ['Online', 'Presencial', 'Ambos'];

const getEstadoStyles = (estado?: string) => {
  switch (estado) {
    case 'Candidato':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Entrevista OK':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Ativo':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Inativo':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export function TrainersView() {
  const [trainers, setTrainers] = useState<Formador[]>([]);
  const [linguasList, setLinguasList] = useState<Lingua[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [editingTrainer, setEditingTrainer] = useState<Formador | null>(null);
  const [trainerToDelete, setTrainerToDelete] = useState<Formador | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');

  const [formData, setFormData] = useState<Omit<Formador, 'id'>>(INITIAL_FORM_DATA);

  const loadData = async () => {
    try {
      const [formadoresData, linguasData] = await Promise.all([
        getFormadores(),
        getLinguas()
      ]);
      setTrainers(formadoresData);
      setLinguasList(linguasData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (trainer?: Formador, mode: 'create' | 'edit' | 'view' = 'create') => {
    setModalMode(mode);
    if (trainer) {
      setEditingTrainer(trainer);
      setFormData({
        nome: trainer.nome,
        email: trainer.email,
        telefone: trainer.telefone || '',
        nif: trainer.nif || '',
        iban: trainer.iban || '',
        linguas: trainer.linguas || [],
        estado: trainer.estado || 'Candidato',
        dataEnvioCv: trainer.dataEnvioCv || '',
        dataPrimeiraEntrevista: trainer.dataPrimeiraEntrevista || '',
        observacoes: trainer.observacoes || '',
        disponibilidadeHorario: trainer.disponibilidadeHorario || '',
        modalidadeAula: trainer.modalidadeAula || 'Online',
        custoHoraBase: trainer.custoHoraBase,
        inicioColaboracao: trainer.inicioColaboracao || ''
      });
    } else {
      setEditingTrainer(null);
      setFormData({ ...INITIAL_FORM_DATA });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrainer(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLanguageToggle = (langCode: string) => {
    setFormData(prev => {
      const curr = prev.linguas || [];
      if (curr.includes(langCode)) {
        return { ...prev, linguas: curr.filter(c => c !== langCode) };
      } else {
        return { ...prev, linguas: [...curr, langCode] };
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clean up empty strings to undefined to keep DB clean
    const cleanedData: Partial<Formador> = { ...formData };
    Object.keys(cleanedData).forEach(key => {
      const k = key as keyof Formador;
      if (cleanedData[k] === '') {
        delete cleanedData[k];
      }
    });

    try {
      if (editingTrainer) {
        await updateFormador(editingTrainer.id, cleanedData);
      } else {
        await addFormador(cleanedData as Omit<Formador, 'id'>);
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving formador:", error);
      alert("Erro ao guardar formador.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!trainerToDelete) return;
    try {
      await deleteFormador(trainerToDelete.id);
      await loadData();
      setTrainerToDelete(null);
    } catch (error) {
      console.error("Error deleting trainer:", error);
      alert("Erro ao apagar formador.");
    }
  };

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = 
      trainer.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trainer.email && trainer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (trainer.nif && trainer.nif.includes(searchTerm));
      
    const matchesStatus = statusFilter === '' || trainer.estado === statusFilter;
    const matchesLanguage = languageFilter === '' || (trainer.linguas && trainer.linguas.includes(languageFilter));

    return matchesSearch && matchesStatus && matchesLanguage;
  });

  const isViewMode = modalMode === 'view';

  return (
    <div className="max-w-full mx-auto pb-4">
      <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex flex-wrap gap-4 justify-between items-center mb-4">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <div className="relative w-full sm:max-w-md flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar por nome, email ou NIF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full sm:w-40 pl-3 pr-8 py-2 text-base border border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Todos os Estados</option>
            {ESTADOS.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="block w-full sm:w-40 pl-3 pr-8 py-2 text-base border border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Todas as Línguas</option>
            {linguasList.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => handleOpenModal(undefined, 'create')}
            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Novo Formador
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Modalidade</th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Custo Hora</th>
                <th scope="col" className="px-6 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredTrainers.map((trainer) => (
                <tr key={trainer.id} className="hover:bg-slate-50">
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-slate-900">{trainer.nome}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-slate-500">{trainer.email}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoStyles(trainer.estado)}`}>
                      {trainer.estado || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-slate-500">{trainer.modalidadeAula || '-'}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-slate-500">
                    {trainer.custoHoraBase ? `${trainer.custoHoraBase}€/h` : '-'}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(trainer, 'view')}
                      className="text-slate-500 hover:text-slate-700 mr-3"
                      title="Ver Detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(trainer, 'edit')}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTrainerToDelete(trainer)}
                      className="text-red-600 hover:text-red-900"
                      title="Apagar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTrainers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    Nenhum formador encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={handleCloseModal} />
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <h2 className="text-xl font-semibold text-slate-900">
                {modalMode === 'create' ? 'Novo Formador' : modalMode === 'edit' ? 'Editar Formador' : 'Detalhes do Formador'}
              </h2>
            </div>

            <form id="trainer-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Secção 1: Dados Pessoais */}
              <section>
                <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-200 pb-2">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                    <input type="text" required disabled={isViewMode} name="nome" value={formData.nome} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input type="email" required disabled={isViewMode} name="email" value={formData.email} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                    <input type="tel" disabled={isViewMode} name="telefone" value={formData.telefone} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">NIF</label>
                    <input type="text" disabled={isViewMode} name="nif" value={formData.nif} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">IBAN</label>
                    <input type="text" disabled={isViewMode} name="iban" value={formData.iban} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-900" />
                  </div>
                </div>
              </section>

              {/* Secção 2: Recrutamento */}
              <section>
                <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-200 pb-2">Recrutamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                    <select disabled={isViewMode} name="estado" value={formData.estado} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-900">
                      {ESTADOS.map(est => (
                        <option key={est} value={est}>{est}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data de Envio do CV</label>
                    <input type="date" disabled={isViewMode} name="dataEnvioCv" value={formData.dataEnvioCv} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data 1ª Entrevista</label>
                    <input type="date" disabled={isViewMode} name="dataPrimeiraEntrevista" value={formData.dataPrimeiraEntrevista} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Início Colaboração</label>
                    <input type="date" disabled={isViewMode} name="inicioColaboracao" value={formData.inicioColaboracao} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-900" />
                  </div>
                  <div className="col-span-1 lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Observações / Notas CV</label>
                    <textarea disabled={isViewMode} name="observacoes" value={formData.observacoes} onChange={handleChange} rows={1} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-900" />
                  </div>
                </div>
              </section>

              {/* Secção 3: Preferências/Condições */}
              <section>
                <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-200 pb-2">Preferências e Condições</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Línguas (Multi-Select) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Línguas Validadas</label>
                    <div className="flex flex-wrap gap-2">
                      {linguasList.map(lang => {
                        const isSelected = (formData.linguas || []).includes(lang.code);
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            disabled={isViewMode}
                            onClick={() => handleLanguageToggle(lang.code)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              isSelected 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            } ${isViewMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 mr-1" />}
                            {lang.name}
                          </button>
                        );
                      })}
                      {linguasList.length === 0 && (
                        <span className="text-sm text-slate-500 italic">Nenhuma língua configurada.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Disponibilidade Horário</label>
                    <input type="text" disabled={isViewMode} name="disponibilidadeHorario" value={formData.disponibilidadeHorario} onChange={handleChange} placeholder="Ex: Manhãs, Fim de semana" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Custo Hora Base (€)</label>
                    <input type="number" disabled={isViewMode} name="custoHoraBase" value={formData.custoHoraBase || ''} onChange={handleChange} min="0" step="0.5" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Modalidade de Aula</label>
                    <select disabled={isViewMode} name="modalidadeAula" value={formData.modalidadeAula} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-900">
                      {MODALIDADES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                </div>
              </section>

            </form>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isViewMode ? 'Fechar' : 'Cancelar'}
              </button>
              {!isViewMode && (
                <button 
                  type="submit" 
                  form="trainer-form"
                  disabled={isSubmitting}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'A Guardar...' : 'Guardar Formador'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {trainerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setTrainerToDelete(null)} />
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-in fade-in zoom-in-95 duration-200 p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 text-center mb-2">Apagar Formador</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Tem a certeza que deseja apagar o formador <strong>{trainerToDelete.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setTrainerToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
