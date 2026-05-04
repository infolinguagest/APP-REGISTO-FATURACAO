import React, { useState, useEffect, useMemo } from 'react';
import { Course, PaymentInstallment } from '../types';
import { getActiveCourses } from '../services/dbService';
import { Loader2, TrendingUp, AlertCircle, Calendar, Euro } from 'lucide-react';
import { formatShortDate } from '../utils/dateUtils';
import { formatNumber } from '../utils/formatUtils';

interface BillingDashboardViewProps {
  refreshTrigger: number;
  onOpenCourse: (courseId: string) => void;
}

interface EnrichedParcela extends PaymentInstallment {
  courseId: string;
  courseRef: string;
  companyName: string;
  audience: 'B' | 'C';
}

export function BillingDashboardView({ refreshTrigger, onOpenCourse }: BillingDashboardViewProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [filterYear, setFilterYear] = useState<number>(currentYear);
  const [filterMonth, setFilterMonth] = useState<number>(currentMonth);
  const [filterAudience, setFilterAudience] = useState<'Todos' | 'B2B' | 'Linguagest'>('Todos');
  const [filterCompany, setFilterCompany] = useState<string>('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getActiveCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [refreshTrigger]);

  // Extract all parcelas
  const allParcelas = useMemo(() => {
    const parcelas: EnrichedParcela[] = [];
    courses.forEach(course => {
      if (course.parcelas) {
        course.parcelas.forEach(p => {
          parcelas.push({
            ...p,
            courseId: course.id,
            courseRef: course.reference,
            companyName: course.audience === 'C' ? 'Linguagest' : (course.empresa || '-'),
            audience: course.audience as 'B' | 'C'
          });
        });
      }
    });
    return parcelas;
  }, [courses]);

  // Filtered parcelas based on Audience and Company
  const filteredParcelas = useMemo(() => {
    return allParcelas.filter(p => {
      if (filterAudience === 'Linguagest' && p.companyName !== 'Linguagest') return false;
      if (filterAudience === 'B2B') {
        if (p.audience !== 'B') return false;
        if (filterCompany && p.companyName !== filterCompany) return false;
      }
      return true;
    });
  }, [allParcelas, filterAudience, filterCompany]);

  // Unique companies for B2B dropdown
  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    courses.forEach(c => {
      if (c.audience === 'B' && c.empresa) {
        companies.add(c.empresa);
      }
    });
    return Array.from(companies).sort();
  }, [courses]);

  // Available years for dropdown
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    allParcelas.forEach(p => {
      if (p.dataPrevista) {
        years.add(new Date(p.dataPrevista).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [allParcelas, currentYear]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let faturadoAnual = 0;
    let faturadoMensal = 0;
    let porReceberAtrasado = 0;
    let previsaoMes = 0;

    filteredParcelas.forEach(p => {
      if (!p.dataPrevista) return;
      const dataPrevista = new Date(p.dataPrevista);
      const year = dataPrevista.getFullYear();
      const month = dataPrevista.getMonth() + 1;

      // Faturado Anual (YTD): Soma das parcelas ("Faturada" ou "Paga") do ano selecionado
      if (year === filterYear && (p.estado === 'Faturada' || p.estado === 'Paga')) {
        faturadoAnual += p.valor || 0;
      }

      // Faturado Mensal: Soma das parcelas do mês e ano selecionados
      if (year === filterYear && month === filterMonth && (p.estado === 'Faturada' || p.estado === 'Paga')) {
        faturadoMensal += p.valor || 0;
      }

      // Por Receber / Atrasado: dataPrevista já passou de Hoje, mas o estado NÃO é "Paga"
      if (dataPrevista < today && p.estado !== 'Paga') {
        porReceberAtrasado += p.valor || 0;
      }

      // Previsão do Mês: Soma das parcelas com dataPrevista para o mês selecionado que ainda estão "Por Faturar"
      if (year === filterYear && month === filterMonth && p.estado === 'Por Faturar') {
        previsaoMes += p.valor || 0;
      }
    });

    return { faturadoAnual, faturadoMensal, porReceberAtrasado, previsaoMes };
  }, [filteredParcelas, filterYear, filterMonth]);

  // Action Lists
  const actionLists = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const atrasos = filteredParcelas.filter(p => {
      if (!p.dataPrevista) return false;
      const dataPrevista = new Date(p.dataPrevista);
      const limitDate = new Date(today);
      limitDate.setDate(limitDate.getDate() + 3);
      return dataPrevista <= limitDate && p.estado !== 'Paga';
    }).sort((a, b) => new Date(a.dataPrevista).getTime() - new Date(b.dataPrevista).getTime());

    const aFaturarEsteMes = filteredParcelas.filter(p => {
      if (!p.dataPrevista) return false;
      const dataPrevista = new Date(p.dataPrevista);
      return dataPrevista.getFullYear() === filterYear && 
             (dataPrevista.getMonth() + 1) === filterMonth && 
             p.estado === 'Por Faturar';
    }).sort((a, b) => new Date(a.dataPrevista).getTime() - new Date(b.dataPrevista).getTime());

    return { atrasos, aFaturarEsteMes };
  }, [filteredParcelas, filterYear, filterMonth]);

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
      <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 mb-4 flex flex-wrap gap-4 items-center">
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

        <select
          value={filterAudience}
          onChange={(e) => {
            setFilterAudience(e.target.value as any);
            if (e.target.value !== 'B2B') setFilterCompany('');
          }}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="Todos">Todos os Públicos</option>
          <option value="B2B">B2B - Empresas</option>
          <option value="Linguagest">Linguagest</option>
        </select>

        {filterAudience === 'B2B' && (
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Todas as Empresas</option>
            {uniqueCompanies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Faturado Anual (YTD)</h3>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatNumber(kpis.faturadoAnual)} €</p>
          <p className="text-xs text-slate-400 mt-2">Ano {filterYear}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Faturado Mensal</h3>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Euro className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatNumber(kpis.faturadoMensal)} €</p>
          <p className="text-xs text-slate-400 mt-2">Mês {filterMonth}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Por Receber / Atrasado</h3>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatNumber(kpis.porReceberAtrasado)} €</p>
          <p className="text-xs text-slate-400 mt-2">Total acumulado</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Previsão do Mês</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatNumber(kpis.previsaoMes)} €</p>
          <p className="text-xs text-slate-400 mt-2">Por faturar em {new Date(2000, filterMonth - 1).toLocaleString('pt-PT', { month: 'long' })}</p>
        </div>
      </div>

      {/* Action Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de Faturação (Atrasos) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-red-50/30 flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                Alertas de Faturação (Atrasos)
              </h3>
              <p className="text-xs text-slate-500 mt-1 ml-7">Inclui faturas com vencimento nos próximos 3 dias</p>
            </div>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full mt-1">
              {actionLists.atrasos.length}
            </span>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            {actionLists.atrasos.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Não existem parcelas em atraso.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data Prevista</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Curso</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Empresa</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Valor</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {actionLists.atrasos.map((p, idx) => {
                    const isUpcoming = new Date(p.dataPrevista) >= new Date(new Date().setHours(0,0,0,0));
                    return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${isUpcoming ? 'text-amber-500' : 'text-red-600'}`}>
                        {formatShortDate(p.dataPrevista)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 font-mono">
                        {p.courseRef}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">
                        {p.companyName}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 text-right font-medium">
                        {formatNumber(p.valor)} €
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => onOpenCourse(p.courseId)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* A Faturar Este Mês */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-blue-50/30 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              A Faturar Este Mês
            </h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {actionLists.aFaturarEsteMes.length}
            </span>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            {actionLists.aFaturarEsteMes.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Não existem parcelas por faturar este mês.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data Prevista</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Curso</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Empresa</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Valor</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {actionLists.aFaturarEsteMes.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                        {formatShortDate(p.dataPrevista)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 font-mono">
                        {p.courseRef}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">
                        {p.companyName}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 text-right font-medium">
                        {formatNumber(p.valor)} €
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => onOpenCourse(p.courseId)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
