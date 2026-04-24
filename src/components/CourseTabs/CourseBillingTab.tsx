import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { BarChart3, Save, Loader2, Plus, Trash2, X, Edit } from 'lucide-react';
import { updateCourseDetails } from '../../services/dbService';
import { useToast } from '../../contexts/ToastContext';
import { formatNumber } from '../../utils/formatUtils';

interface CourseBillingTabProps {
  currentCourse: Course;
  onUpdate: () => void;
  setCurrentCourse: (course: Course) => void;
}

export function CourseBillingTab({
  currentCourse,
  onUpdate,
  setCurrentCourse
}: CourseBillingTabProps) {
  const { showToast } = useToast();
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [adminData, setAdminData] = useState({
    numeroProposta: '',
    valorTotalCliente: '',
    faturadoDetalhes: '',
    dataEmissaoCertificados: '',
    dataEnvioRH: ''
  });
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);

  useEffect(() => {
    if (currentCourse) {
      setAdminData({
        numeroProposta: currentCourse.numeroProposta || '',
        valorTotalCliente: currentCourse.valorTotalCliente !== undefined ? currentCourse.valorTotalCliente.toString() : '',
        faturadoDetalhes: currentCourse.faturadoDetalhes || '',
        dataEmissaoCertificados: currentCourse.dataEmissaoCertificados || '',
        dataEnvioRH: currentCourse.dataEnvioRH || ''
      });
      setParcelas(currentCourse.parcelas || []);
    }
  }, [currentCourse]);

  const handleSaveAdminData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCourse) return;

    setIsSavingAdmin(true);
    try {
      const dataToSave = {
        numeroProposta: adminData.numeroProposta,
        valorTotalCliente: adminData.valorTotalCliente ? parseFloat(adminData.valorTotalCliente) : undefined,
        faturadoDetalhes: adminData.faturadoDetalhes,
        dataEmissaoCertificados: adminData.dataEmissaoCertificados,
        dataEnvioRH: adminData.dataEnvioRH,
        parcelas: parcelas
      };

      const updatedCourse = await updateCourseDetails(currentCourse.id, dataToSave, 'Catarina Gomes');
      setCurrentCourse(updatedCourse);
      onUpdate();
      showToast('Dados de faturação guardados com sucesso!', 'success');
      setIsEditingAdmin(false);
    } catch (error) {
      console.error('Failed to save admin data', error);
      showToast('Erro ao guardar dados administrativos.', 'error');
    } finally {
      setIsSavingAdmin(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Analítico */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
          <BarChart3 className="h-4 w-4 mr-2 text-indigo-500" />
          Dashboard Analítico
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-[10px] font-medium text-slate-500 uppercase">Total Faturado</p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {formatNumber(parcelas.filter(p => p.estado !== 'Por Faturar').reduce((sum, p) => sum + (p.valor || 0), 0))} €
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-[10px] font-medium text-slate-500 uppercase">Por Faturar</p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {formatNumber(parcelas.filter(p => p.estado === 'Por Faturar').reduce((sum, p) => sum + (p.valor || 0), 0))} €
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-[10px] font-medium text-slate-500 uppercase">Valor Total Cliente</p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {formatNumber(adminData.valorTotalCliente ? parseFloat(adminData.valorTotalCliente) : 0)} €
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-[10px] font-medium text-slate-500 uppercase">Custo Formador</p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {formatNumber((currentCourse.trainerCost || 0) * ((currentCourse.horasFormador || 0) + (currentCourse.horasPlataforma || 0)))} €
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveAdminData} className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Dados de Faturação</h3>
            {!isEditingAdmin && (
              <button
                type="button"
                onClick={() => setIsEditingAdmin(true)}
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Editar Faturação
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nº Proposta</label>
              {isEditingAdmin ? (
                <input
                  type="text"
                  value={adminData.numeroProposta}
                  onChange={(e) => setAdminData({...adminData, numeroProposta: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ex: PROP-2023-001"
                />
              ) : (
                <div className="text-sm text-slate-900 font-medium py-2">{adminData.numeroProposta || '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Valor Total Cliente (€)</label>
              {isEditingAdmin ? (
                <input
                  type="number"
                  step="0.01"
                  value={adminData.valorTotalCliente}
                  onChange={(e) => setAdminData({...adminData, valorTotalCliente: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              ) : (
                <div className="text-sm text-slate-900 font-medium py-2">{adminData.valorTotalCliente ? `${formatNumber(parseFloat(adminData.valorTotalCliente))} €` : '-'}</div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-medium text-slate-700">Plano de Pagamentos</label>
              {isEditingAdmin && (
                <button
                  type="button"
                  onClick={() => setParcelas([...parcelas, { id: Date.now().toString(), valor: 0, dataPrevista: '', estado: 'Por Faturar', descricao: '' }])}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar Parcela
                </button>
              )}
            </div>
            
            {parcelas.length === 0 ? (
              <div className="text-center py-4 text-sm text-slate-500 border border-dashed border-slate-300 rounded-md">
                Nenhuma parcela definida.
              </div>
            ) : (
              <div className="space-y-3">
                {parcelas.map((parcela, index) => (
                  <div key={parcela.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                    {/* Linha 1: Descrição, Observações, Delete */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Descrição</label>
                          {isEditingAdmin ? (
                            <input
                              type="text"
                              value={parcela.descricao || ''}
                              onChange={(e) => {
                                const newParcelas = [...parcelas];
                                newParcelas[index].descricao = e.target.value;
                                setParcelas(newParcelas);
                              }}
                              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                              placeholder="Ex: 1ª Prestação"
                            />
                          ) : (
                            <div className="text-sm text-slate-900 py-1.5">{parcela.descricao || '-'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Observações</label>
                          {isEditingAdmin ? (
                            <input
                              type="text"
                              value={parcela.observacoes || ''}
                              onChange={(e) => {
                                const newParcelas = [...parcelas];
                                newParcelas[index].observacoes = e.target.value;
                                setParcelas(newParcelas);
                              }}
                              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                              placeholder="Notas adicionais"
                            />
                          ) : (
                            <div className="text-sm text-slate-900 py-1.5">{parcela.observacoes || '-'}</div>
                          )}
                        </div>
                      </div>
                      {isEditingAdmin && (
                        <div className="pt-5">
                          {confirmingDelete === parcela.id ? (
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const newParcelas = parcelas.filter(p => p.id !== parcela.id);
                                  setParcelas(newParcelas);
                                  setConfirmingDelete(null);
                                }}
                                className="p-1.5 text-white bg-red-600 rounded hover:bg-red-700"
                                title="Confirmar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingDelete(null)}
                                className="p-1.5 text-slate-600 bg-slate-200 rounded hover:bg-slate-300"
                                title="Cancelar"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmingDelete(parcela.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                              title="Remover"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Linha 2: Valor, Data Prevista, Estado, [Data Faturado], [Data Pagamento] */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Valor (€)</label>
                        {isEditingAdmin ? (
                          <input
                            type="number"
                            step="0.01"
                            value={parcela.valor || ''}
                            onChange={(e) => {
                              const newParcelas = [...parcelas];
                              newParcelas[index].valor = parseFloat(e.target.value);
                              setParcelas(newParcelas);
                            }}
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                            placeholder="0.00"
                          />
                        ) : (
                          <div className="text-sm text-slate-900 font-medium py-1.5">{formatNumber(parcela.valor)} €</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Data Prevista</label>
                        {isEditingAdmin ? (
                          <input
                            type="date"
                            value={parcela.dataPrevista || ''}
                            onChange={(e) => {
                              const newParcelas = [...parcelas];
                              newParcelas[index].dataPrevista = e.target.value;
                              setParcelas(newParcelas);
                            }}
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                          />
                        ) : (
                          <div className="text-sm text-slate-900 py-1.5">{parcela.dataPrevista || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Estado</label>
                        {isEditingAdmin ? (
                          <select
                            value={parcela.estado || 'Por Faturar'}
                            onChange={(e) => {
                              const newParcelas = [...parcelas];
                              newParcelas[index].estado = e.target.value;
                              setParcelas(newParcelas);
                            }}
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                          >
                            <option value="Por Faturar">Por Faturar</option>
                            <option value="Faturada">Faturada</option>
                            <option value="Paga">Paga</option>
                          </select>
                        ) : (
                          <div className="text-sm py-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              parcela.estado === 'Paga' ? 'bg-green-100 text-green-800' :
                              parcela.estado === 'Faturada' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {parcela.estado || 'Por Faturar'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {(parcela.estado === 'Faturada' || parcela.estado === 'Paga') && (
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Data Faturado</label>
                          {isEditingAdmin ? (
                            <input
                              type="date"
                              value={parcela.dataFaturado || ''}
                              onChange={(e) => {
                                const newParcelas = [...parcelas];
                                newParcelas[index].dataFaturado = e.target.value;
                                setParcelas(newParcelas);
                              }}
                              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                            />
                          ) : (
                            <div className="text-sm text-slate-900 py-1.5">{parcela.dataFaturado || '-'}</div>
                          )}
                        </div>
                      )}

                      {parcela.estado === 'Paga' && (
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Data Pagamento</label>
                          {isEditingAdmin ? (
                            <input
                              type="date"
                              value={parcela.dataPagamento || ''}
                              onChange={(e) => {
                                const newParcelas = [...parcelas];
                                newParcelas[index].dataPagamento = e.target.value;
                                setParcelas(newParcelas);
                              }}
                              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                            />
                          ) : (
                            <div className="text-sm text-slate-900 py-1.5">{parcela.dataPagamento || '-'}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Observações Gerais de Faturação</label>
            {isEditingAdmin ? (
              <textarea
                value={adminData.faturadoDetalhes}
                onChange={(e) => setAdminData({...adminData, faturadoDetalhes: e.target.value})}
                rows={3}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Notas adicionais sobre a faturação..."
              />
            ) : (
              <div className="text-sm text-slate-900 bg-slate-50 p-3 rounded-md border border-slate-100 min-h-[60px] whitespace-pre-wrap">
                {adminData.faturadoDetalhes || '-'}
              </div>
            )}
          </div>
        </div>

        {isEditingAdmin && (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsEditingAdmin(false);
                // Reset to current course data
                setAdminData({
                  numeroProposta: currentCourse.numeroProposta || '',
                  valorTotalCliente: currentCourse.valorTotalCliente !== undefined ? currentCourse.valorTotalCliente.toString() : '',
                  faturadoDetalhes: currentCourse.faturadoDetalhes || '',
                  dataEmissaoCertificados: currentCourse.dataEmissaoCertificados || '',
                  dataEnvioRH: currentCourse.dataEnvioRH || ''
                });
                setParcelas(currentCourse.parcelas || []);
              }}
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSavingAdmin}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSavingAdmin ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Alterações
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
