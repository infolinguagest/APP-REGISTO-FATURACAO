import React, { useState, useEffect } from 'react';
import { Building, Plus, Search, Edit2, Trash2, X, Users, Mail, Phone, Loader2, Eye, AlertTriangle } from 'lucide-react';
import { Empresa, DRH } from '../types';
import { getEmpresas, addEmpresa, updateEmpresa, deleteEmpresa } from '../services/dbService';

interface EmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (empresa: Omit<Empresa, 'id' | 'isB2C'> | Empresa) => Promise<void>;
  initialData?: Empresa;
  modalMode?: 'create' | 'edit' | 'view';
}

function EmpresaModal({ isOpen, onClose, onSave, initialData, modalMode = 'create' }: EmpresaModalProps) {
  const [nome, setNome] = useState('');
  const [nifFaturacao, setNifFaturacao] = useState('');
  const [drhs, setDrhs] = useState<DRH[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;
  const isLinguagest = initialData?.id === 'emp_linguagest';

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNome(initialData.nome || '');
        setNifFaturacao(initialData.nifFaturacao || '');
        setDrhs(initialData.drhs ? [...initialData.drhs] : []);
      } else {
        setNome('');
        setNifFaturacao('');
        setDrhs([]);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddDrh = () => {
    setDrhs([...drhs, { id: Date.now().toString(), nome: '', email: '', telefone: '' }]);
  };

  const handleRemoveDrh = (idToRemove: string) => {
    setDrhs(drhs.filter(drh => drh.id !== idToRemove));
  };

  const handleDrhChange = (id: string, field: keyof DRH, value: string) => {
    setDrhs(drhs.map(drh => drh.id === id ? { ...drh, [field]: value } : drh));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Filter out empty DRHs (must have at least a name)
    const validDrhs = drhs.filter(drh => drh.nome.trim() !== '');

    const empresaData = {
      ...(isEditing ? { id: initialData.id, isB2C: initialData.isB2C } : {}),
      nome,
      nifFaturacao: nifFaturacao || undefined,
      drhs: validDrhs
    };

    try {
      await onSave(empresaData as any);
      onClose();
    } catch (error) {
      console.error('Error saving empresa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
          <h2 className="text-xl font-semibold text-slate-900">
            {modalMode === 'view' ? 'Detalhes da Empresa' : isEditing ? 'Editar Empresa' : 'Nova Empresa'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form id="empresa-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Dados da Empresa */}
          <section>
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-200 pb-2">Dados da Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa *</label>
                <input 
                  type="text" 
                  required 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  disabled={isLinguagest || modalMode === 'view'}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500" 
                />
                {isLinguagest && modalMode !== 'view' && <p className="mt-1 text-xs text-slate-500">O nome da entidade de sistema não pode ser alterado.</p>}
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">NIF (Opcional)</label>
                <input 
                  type="text" 
                  value={nifFaturacao} 
                  onChange={(e) => setNifFaturacao(e.target.value)} 
                  disabled={modalMode === 'view'}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500" 
                />
              </div>
            </div>
          </section>

          {/* Contactos RH (DRHs) */}
          <section>
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <h3 className="text-lg font-medium text-slate-900">Contactos RH (DRHs)</h3>
              {modalMode !== 'view' && (
                <button 
                  type="button" 
                  onClick={handleAddDrh}
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-xs font-medium rounded text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Adicionar Contacto
                </button>
              )}
            </div>

            {drhs.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <Users className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">Nenhum contacto adicionado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {drhs.map((drh, index) => (
                  <div key={drh.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Nome *</label>
                        <input 
                          type="text" 
                          required
                          value={drh.nome} 
                          onChange={(e) => handleDrhChange(drh.id, 'nome', e.target.value)} 
                          disabled={modalMode === 'view'}
                          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                        <input 
                          type="email" 
                          value={drh.email} 
                          onChange={(e) => handleDrhChange(drh.id, 'email', e.target.value)} 
                          disabled={modalMode === 'view'}
                          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500" 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Telefone</label>
                        <input 
                          type="tel" 
                          value={drh.telefone || ''} 
                          onChange={(e) => handleDrhChange(drh.id, 'telefone', e.target.value)} 
                          disabled={modalMode === 'view'}
                          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500" 
                        />
                      </div>
                    </div>
                    {modalMode !== 'view' && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveDrh(drh.id)}
                        className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors mt-5"
                        title="Remover contacto"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {modalMode === 'view' ? 'Fechar' : 'Cancelar'}
          </button>
          {modalMode !== 'view' && (
            <button 
              type="submit" 
              form="empresa-form"
              disabled={isSubmitting}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  A Guardar...
                </>
              ) : (
                isEditing ? 'Guardar Alterações' : 'Criar Empresa'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CompaniesView() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | undefined>(undefined);
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | undefined>(undefined);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getEmpresas();
      setEmpresas(data);
    } catch (error) {
      console.error("Error loading empresas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (empresa?: Empresa, mode: 'create' | 'edit' | 'view' = 'edit') => {
    setSelectedEmpresa(empresa);
    setModalMode(empresa ? mode : 'create');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmpresa(undefined);
  };

  const handleSaveEmpresa = async (empresaData: Omit<Empresa, 'id' | 'isB2C'> | Empresa) => {
    try {
      if ('id' in empresaData && empresaData.id) {
        await updateEmpresa(empresaData.id, empresaData);
      } else {
        await addEmpresa(empresaData);
      }
      await loadData();
    } catch (error) {
      console.error("Error saving empresa:", error);
      alert("Erro ao guardar empresa.");
    }
  };

  const confirmDelete = async () => {
    if (!empresaToDelete) return;
    try {
      await deleteEmpresa(empresaToDelete.id);
      await loadData();
      setEmpresaToDelete(undefined);
    } catch (error) {
      console.error("Error deleting empresa:", error);
      alert("Erro ao apagar empresa.");
    }
  };

  const filteredEmpresas = empresas.filter(emp => 
    emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.nifFaturacao && emp.nifFaturacao.includes(searchTerm))
  );

  return (
    <div className="max-w-full mx-auto pb-4">
      {/* Search and Filters */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
        <div className="relative flex-1 w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por nome ou NIF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <button 
          onClick={() => handleOpenModal(undefined, 'create')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto justify-center"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Nova Empresa
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
            <p>A carregar empresas...</p>
          </div>
        ) : filteredEmpresas.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Building className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-1">Nenhuma empresa encontrada</p>
            <p>Tente ajustar a sua pesquisa ou adicione uma nova empresa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nome da Empresa
                  </th>
                  <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    NIF
                  </th>
                  <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contacto RH (Principal)
                  </th>
                  <th scope="col" className="px-6 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredEmpresas.map((empresa) => {
                  const isLinguagest = empresa.id === 'emp_linguagest' || empresa.isB2C;
                  
                  return (
                    <tr key={empresa.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{empresa.nome}</div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm text-slate-500">{empresa.nifFaturacao || '-'}</div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        {empresa.drhs && empresa.drhs.length > 0 ? (
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900">{empresa.drhs[0].nome}</span>
                              {empresa.drhs.length > 1 && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  +{empresa.drhs.length - 1}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{empresa.drhs[0].email}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Sem contactos</span>
                        )}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenModal(empresa, 'view')}
                            className="text-slate-500 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenModal(empresa, 'edit')}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {!isLinguagest && (
                            <button 
                              onClick={() => setEmpresaToDelete(empresa)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                              title="Apagar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmpresaModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveEmpresa}
        initialData={selectedEmpresa}
        modalMode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      {empresaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setEmpresaToDelete(undefined)} />
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-in fade-in zoom-in-95 duration-200 p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 text-center mb-2">Apagar Empresa</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Tem a certeza que deseja apagar a empresa <strong>{empresaToDelete.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEmpresaToDelete(undefined)}
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
