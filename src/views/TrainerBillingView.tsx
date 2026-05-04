import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Course, Formador, HonorarioFormador } from '../types';
import { getActiveCourses, getFormadores, updateCourseHonorarios } from '../services/dbService';
import { Wallet, Banknote, Search, ExternalLink, Loader2, Euro, X, Receipt } from 'lucide-react';
import { formatNumber } from '../utils/formatUtils';

interface TrainerBillingViewProps {
  refreshTrigger: number;
}

export function TrainerBillingView({ refreshTrigger }: TrainerBillingViewProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formadores, setFormadores] = useState<Formador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [filterYear, setFilterYear] = useState<number>(currentYear);
  const [filterMonth, setFilterMonth] = useState<number>(currentMonth);

  // Available years for dropdown
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    courses.forEach(c => {
      if (c.honorariosFormador) {
        c.honorariosFormador.forEach(h => {
          if (h.mesReferencia) {
            const [y] = h.mesReferencia.split('-');
            if (y) years.add(Number(y));
          }
        });
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [courses, currentYear]);

  // Modal State
  const [selectedFormadorId, setSelectedFormadorId] = useState<string | null>(null);
  const [selectedHonorariosIds, setSelectedHonorariosIds] = useState<string[]>([]);
  const [numeroRecibo, setNumeroRecibo] = useState('');
  const [dataRecibo, setDataRecibo] = useState('');
  const [taxaIvaAplicada, setTaxaIvaAplicada] = useState<number>(0);
  const [novoEstado, setNovoEstado] = useState<'Faturado' | 'Pago'>('Faturado');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesData, formadoresData] = await Promise.all([
        getActiveCourses(),
        getFormadores()
      ]);
      setCourses(coursesData);
      setFormadores(formadoresData);
    } catch (error) {
      console.error("Failed to load data for TrainerBillingView:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [refreshTrigger, loadData]);

  const formadorSummaries = useMemo(() => {
    const selectedMonthStr = `${filterYear}-${String(filterMonth).padStart(2, '0')}`;
    
    return formadores.map(formador => {
      let totalPorFaturar = 0;
      let totalFaturadoPago = 0;

      // Find courses for this trainer
      const formadorCourses = courses.filter(c => c.formadorId === formador.id);

      formadorCourses.forEach(course => {
        if (course.honorariosFormador) {
          course.honorariosFormador.forEach(honorario => {
            if (honorario.estado === 'Por Faturar') {
              totalPorFaturar += honorario.valorTotal;
            } else if (honorario.estado === 'Faturado' || honorario.estado === 'Pago') {
              if (honorario.mesReferencia === selectedMonthStr) {
                totalFaturadoPago += honorario.valorTotal;
              }
            }
          });
        }
      });

      return {
        ...formador,
        totalPorFaturar,
        totalFaturadoPago
      };
    }).filter(f => f.nome.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [courses, formadores, searchTerm, filterYear, filterMonth]);

  const { globalPorFaturar, globalFaturadoPago } = useMemo(() => {
    let globalPorFaturar = 0;
    let globalFaturadoPago = 0;
    const selectedMonthStr = `${filterYear}-${String(filterMonth).padStart(2, '0')}`;

    // We should probably iterate over all initial formadores summaries regardless of search for globals
    // Re-calculating without the search filter
    formadores.forEach(formador => {
      const formadorCourses = courses.filter(c => c.formadorId === formador.id);
      formadorCourses.forEach(course => {
        if (course.honorariosFormador) {
          course.honorariosFormador.forEach(honorario => {
            if (honorario.estado === 'Por Faturar') {
              globalPorFaturar += honorario.valorTotal;
            } else if (honorario.estado === 'Faturado' || honorario.estado === 'Pago') {
              if (honorario.mesReferencia === selectedMonthStr) {
                globalFaturadoPago += honorario.valorTotal;
              }
            }
          });
        }
      });
    });
    return { globalPorFaturar, globalFaturadoPago };
  }, [courses, formadores, filterYear, filterMonth]);

  const handleOpenModal = (formadorId: string) => {
    setSelectedFormadorId(formadorId);
    const formador = formadores.find(f => f.id === formadorId);
    setTaxaIvaAplicada(formador?.taxaIvaPadrao || 0);
    setSelectedHonorariosIds([]);
    setNumeroRecibo('');
    setDataRecibo('');
    setNovoEstado('Faturado');
  };

  const handleCloseModal = () => {
    setSelectedFormadorId(null);
    setSelectedHonorariosIds([]);
  };

  const selectedFormador = useMemo(() => {
    return formadores.find(f => f.id === selectedFormadorId);
  }, [formadores, selectedFormadorId]);

  const honorariosDetails = useMemo(() => {
    if (!selectedFormadorId) return [];
    return courses
      .filter(c => c.formadorId === selectedFormadorId)
      .flatMap(c => (c.honorariosFormador || []).map(h => ({
        honorario: h,
        courseId: c.id,
        courseReference: c.reference
      })));
  }, [courses, selectedFormadorId]);

  const toggleHonorarioSelection = (id: string) => {
    setSelectedHonorariosIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSaveRecibo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHonorariosIds.length === 0 || !selectedFormadorId) return;

    setIsSubmitting(true);
    
    try {
      // Find which courses need updates
      const coursesToUpdate = new Map<string, HonorarioFormador[]>();
      
      courses.forEach(course => {
        if (course.formadorId !== selectedFormadorId || !course.honorariosFormador) return;
        
        // Check if this course has any selected honorários
        const hasSelected = course.honorariosFormador.some(h => selectedHonorariosIds.includes(h.id));
        
        if (hasSelected) {
          const updatedHonorarios = course.honorariosFormador.map(h => {
            if (selectedHonorariosIds.includes(h.id)) {
              return {
                ...h,
                estado: novoEstado,
                numeroRecibo: numeroRecibo || h.numeroRecibo,
                dataRecibo: dataRecibo || h.dataRecibo,
                taxaIvaAplicada: taxaIvaAplicada
              };
            }
            return h;
          });
          coursesToUpdate.set(course.id, updatedHonorarios);
        }
      });
      
      // Update all affected courses
      const updatePromises = Array.from(coursesToUpdate.entries()).map(([courseId, honorarios]) => 
        updateCourseHonorarios(courseId, honorarios)
      );
      
      await Promise.all(updatePromises);
      
      // Reload and close
      await loadData();
      handleCloseModal();
      
    } catch (error) {
      console.error("Error updating honorários:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto pb-4">

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {new Date(2000, month - 1).toLocaleString('pt-PT', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar formador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total Global Por Faturar (Acumulado)</h3>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Banknote className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600">{formatNumber(globalPorFaturar)} €</p>
          <p className="text-xs text-slate-400 mt-2">Valores pendentes de faturação (Todo o Histórico)</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total Faturado/Pago (Mês)</h3>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Euro className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatNumber(globalFaturadoPago)} €</p>
          <p className="text-xs text-slate-400 mt-2">Valores em {new Date(2000, filterMonth - 1).toLocaleString('pt-PT', { month: 'long' })} {filterYear}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mt-4">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center bg-slate-50 gap-4">
          <h2 className="text-lg font-semibold text-slate-800">Balanço por Formador</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Formador</th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NIF</th>
                <th scope="col" className="px-6 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total Por Faturar (Acumulado)</th>
                <th scope="col" className="px-6 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Faturado/Pago (Mês)</th>
                <th scope="col" className="px-6 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {formadorSummaries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    Nenhum formador encontrado ou corresponde à pesquisa.
                  </td>
                </tr>
              ) : (
                formadorSummaries.map((formador) => (
                  <tr key={formador.id} className="hover:bg-slate-50">
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{formador.nome}</div>
                      <div className="text-xs text-slate-500">{formador.email}</div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-slate-500">
                      {formador.nif || '-'}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium text-amber-600">
                      {formador.totalPorFaturar > 0 ? `${formatNumber(formador.totalPorFaturar)} €` : '-'}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium text-emerald-600">
                      {formador.totalFaturadoPago > 0 ? `${formatNumber(formador.totalFaturadoPago)} €` : '-'}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(formador.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Gerir Honorários
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Gestão de Honorários */}
      {selectedFormadorId && selectedFormador && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedFormador.nome}</h2>
                <div className="flex gap-4 mt-1 text-sm text-slate-500">
                  <span>NIF: {selectedFormador.nif || 'N/A'}</span>
                  <span>IVA Padrão: {selectedFormador.taxaIvaPadrao || 0}%</span>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-6 flex flex-col md:flex-row gap-6">
              
              <div className="flex-1 overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left w-12"></th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Aulas</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Mês</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Tipo</th>
                      <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Qtd</th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Total (€)</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {honorariosDetails.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                          Nenhum honorário registado para este formador.
                        </td>
                      </tr>
                    ) : (
                      honorariosDetails.map((item, index) => {
                        const canSelect = item.honorario.estado === 'Por Faturar';
                        const isSelected = selectedHonorariosIds.includes(item.honorario.id);
                        
                        return (
                          <tr key={`${item.honorario.id}-${index}`} className={isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}>
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                disabled={!canSelect}
                                checked={isSelected}
                                onChange={() => toggleHonorarioSelection(item.honorario.id)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-900 font-medium">
                              {item.courseReference}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-500">
                              {item.honorario.mesReferencia}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-500">
                              {item.honorario.tipo}
                            </td>
                            <td className="px-4 py-2 text-sm text-center text-slate-500">
                              {item.honorario.quantidade}
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-medium text-slate-900">
                              {formatNumber(item.honorario.valorTotal)}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                item.honorario.estado === 'Por Faturar' ? 'bg-amber-100 text-amber-800' :
                                item.honorario.estado === 'Faturado' ? 'bg-blue-100 text-blue-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {item.honorario.estado}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Formação Lateral / Secção Liquidação */}
              <div className="w-full md:w-72 bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-600 mb-4 pb-3 border-b border-indigo-100">
                    <Receipt className="h-5 w-5" />
                    <h3 className="font-semibold">Liquidação</h3>
                  </div>

                  {selectedHonorariosIds.length === 0 ? (
                    <div className="text-sm text-slate-500 text-center py-8">
                      Selecione itens 'Por Faturar' na tabela para registar um recibo.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Novo Estado</label>
                        <select 
                          value={novoEstado} 
                          onChange={e => setNovoEstado(e.target.value as 'Faturado' | 'Pago')}
                          className="w-full rounded-md border-slate-300 border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="Faturado">Faturado</option>
                          <option value="Pago">Pago</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nº do Recibo</label>
                        <input 
                          type="text" 
                          value={numeroRecibo}
                          onChange={e => setNumeroRecibo(e.target.value)}
                          placeholder="Ex: REC-1234"
                          className="w-full rounded-md border-slate-300 border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data do Recibo</label>
                        <input 
                          type="date" 
                          value={dataRecibo}
                          onChange={e => setDataRecibo(e.target.value)}
                          className="w-full rounded-md border-slate-300 border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Taxa de IVA (%)</label>
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={taxaIvaAplicada}
                          onChange={e => setTaxaIvaAplicada(Number(e.target.value))}
                          className="w-full rounded-md border-slate-300 border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedHonorariosIds.length > 0 && (
                  <div className="mt-8">
                    <div className="bg-indigo-50 rounded-lg p-3 text-sm text-indigo-900 mb-4 font-medium flex justify-between items-center">
                      <span>Selecionados:</span>
                      <span className="font-bold text-lg">{selectedHonorariosIds.length}</span>
                    </div>
                    <button
                      onClick={handleSaveRecibo}
                      disabled={isSubmitting}
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Atualizar Itens'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
