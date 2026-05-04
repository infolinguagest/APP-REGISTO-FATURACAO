import React, { useEffect, useState, useRef } from 'react';
import { Course, Lingua } from '../types';
import { getActiveCourses, createCourse, getLinguas } from '../services/dbService';
import { Badge } from '../components/Badge';
import { Search, Plus, Loader2, Settings2 } from 'lucide-react';
import { CourseFormModal } from '../components/CourseFormModal';
import { TabType } from '../components/Layout';
import { formatShortDate } from '../utils/dateUtils';

interface CoursesListViewProps {
  activeTab: TabType;
  refreshTrigger: number;
  onOpenCourse: (courseId: string) => void;
}

const OPTIONAL_COLUMNS = [
  { id: 'progresso', label: 'Progresso' },
  { id: 'sigo', label: 'SIGO (Sim/Não)' },
  { id: 'descricaoFormacao', label: 'Descrição da Formação' },
  { id: 'lingua', label: 'Língua' },
  { id: 'nivel', label: 'Nível' },
  { id: 'local', label: 'Local' },
  { id: 'horarioDias', label: 'Horário / Dias' },
  { id: 'horasFormador', label: 'Hrs Form.' },
  { id: 'horasPlataforma', label: 'Hrs Plat.' },
  { id: 'horasTotais', label: 'Hrs Totais' },
  { id: 'formador', label: 'Formador' },
  { id: 'custoFormador', label: 'Custo/h' },
  { id: 'estruturaCurso', label: 'Estrutura do Curso' },
  { id: 'responsavelRH', label: 'Responsável RH' },
  { id: 'statusFaturacao', label: 'Estado Faturação' },
];

const DEFAULT_COLUMNS = ['progresso', 'lingua', 'nivel', 'local', 'formador'];

export function CoursesListView({ activeTab, refreshTrigger, onOpenCourse }: CoursesListViewProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterFormador, setFilterFormador] = useState('');
  const [filterLingua, setFilterLingua] = useState('');
  const [linguasList, setLinguasList] = useState<Lingua[]>([]);

  // Columns
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedColumns = localStorage.getItem('linguagest_columns_pref');
    if (savedColumns) {
      setSelectedColumns(JSON.parse(savedColumns));
    } else {
      setSelectedColumns(DEFAULT_COLUMNS);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setIsColumnMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColumnToggle = (colId: string) => {
    const newCols = selectedColumns.includes(colId)
      ? selectedColumns.filter(id => id !== colId)
      : [...selectedColumns, colId];
    setSelectedColumns(newCols);
    localStorage.setItem('linguagest_columns_pref', JSON.stringify(newCols));
  };

  const fetchCourses = async () => {
    try {
      const [data, linguas] = await Promise.all([
        getActiveCourses(),
        getLinguas()
      ]);
      setCourses(data);
      setLinguasList(linguas);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    
    const handleFocus = () => {
      fetchCourses();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshTrigger, activeTab]);

  const handleCreateCourse = async (courseData: Omit<Course, 'id' | 'state'>) => {
    await createCourse(courseData);
    await fetchCourses();
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    if (isNaN(start) || isNaN(end)) return 0;
    if (now < start) return 0;
    if (now > end) return 100;
    
    const totalDuration = end - start;
    if (totalDuration <= 0) return 100;
    const elapsed = now - start;
    return Math.round((elapsed / totalDuration) * 100);
  };

  const filteredCourses = courses.filter(course => {
    // Base filter: NOT CONCLUIDO or ANULADO
    if (course.state === 'CONCLUIDO' || course.state === 'ANULADO') return false;
    
    if (searchTerm && !course.reference.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (filterEstado && course.state !== filterEstado) return false;
    
    if (filterEmpresa) {
      const courseEmpresa = course.audience === 'C' ? 'Linguagest' : course.empresa;
      if (courseEmpresa !== filterEmpresa) return false;
    }

    if (filterFormador && course.trainerName !== filterFormador) return false;
    
    if (filterLingua) {
      const courseLang = course.language || '';
      if (!courseLang.toLowerCase().includes(filterLingua.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const uniqueEstados = Array.from(new Set(courses.filter(c => c.state !== 'CONCLUIDO' && c.state !== 'ANULADO').map(c => c.state))).filter(Boolean);
  const uniqueEmpresas = Array.from(new Set(courses.filter(c => c.state !== 'CONCLUIDO' && c.state !== 'ANULADO' && c.audience === 'B').map(c => c.empresa))).filter(e => e && e !== 'Linguagest');
  const uniqueFormadores = Array.from(new Set(courses.filter(c => c.state !== 'CONCLUIDO' && c.state !== 'ANULADO').map(c => c.trainerName))).filter(Boolean);

  const thClass = "px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap";
  const tdClass = "px-4 py-2 whitespace-nowrap text-sm text-slate-700";

  return (
    <div className="max-w-full mx-auto pb-4">
      {/* Toolbar */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar referência..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
            />
          </div>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Todos os Estados</option>
            {uniqueEstados.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>

          <select
            value={filterEmpresa}
            onChange={(e) => setFilterEmpresa(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Todas as Empresas</option>
            <option value="Linguagest">Linguagest</option>
            {uniqueEmpresas.map(empresa => (
              <option key={empresa} value={empresa}>{empresa}</option>
            ))}
          </select>

          <select
            value={filterFormador}
            onChange={(e) => setFilterFormador(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Todos os Formadores</option>
            {uniqueFormadores.map(formador => (
              <option key={formador} value={formador}>{formador}</option>
            ))}
          </select>

          <select
            value={filterLingua}
            onChange={(e) => setFilterLingua(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Todas as Línguas</option>
            {linguasList.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        <div className="relative flex items-center gap-3" ref={columnMenuRef}>
          <button
            onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Gerir Colunas
          </button>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Curso
          </button>
          
          {isColumnMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-slate-200 z-20 py-2">
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Colunas Opcionais</span>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {OPTIONAL_COLUMNS.map(col => (
                  <label key={col.id} className="flex items-center px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col.id)}
                      onChange={() => handleColumnToggle(col.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded mr-3"
                    />
                    <span className="text-sm text-slate-700">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {/* Fixed Columns */}
                  <th scope="col" className={`${thClass} w-32`}>Referência</th>
                  <th scope="col" className={`${thClass} w-24`}>Estado</th>
                  <th scope="col" className={`${thClass} w-28 text-center`}>Data Início</th>
                  <th scope="col" className={`${thClass} w-28 text-center`}>Conclusão Prev.</th>
                  <th scope="col" className={`${thClass} max-w-[150px]`}>Empresa</th>
                  
                  {/* Optional Columns */}
                  {OPTIONAL_COLUMNS.filter(col => selectedColumns.includes(col.id)).map(col => {
                    let extraClass = '';
                    if (['progresso', 'horasFormador', 'horasPlataforma', 'horasTotais', 'nivel', 'custoFormador'].includes(col.id)) {
                      extraClass = ' w-20 text-center';
                    } else if (['formador', 'local', 'responsavelRH'].includes(col.id)) {
                      extraClass = ' max-w-[150px]';
                    } else if (col.id === 'descricaoFormacao') {
                      extraClass = ' max-w-[200px]';
                    }
                    return <th key={col.id} scope="col" className={`${thClass}${extraClass}`}>{col.label}</th>;
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredCourses.map((course) => (
                  <tr 
                    key={course.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onOpenCourse(course.id)}
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-slate-900 font-mono w-32">
                      {course.reference}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap w-24">
                      <Badge state={course.state} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 w-28 text-center">
                      {formatShortDate(course.startDate)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 w-28 text-center">
                      {formatShortDate(course.expectedEndDate)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-900 max-w-[150px] truncate" title={course.audience === 'C' ? 'Linguagest' : (course.empresa || 'Linguagest')}>
                      {course.audience === 'C' ? 'Linguagest' : (course.empresa || 'Linguagest')}
                    </td>

                    {/* Optional Columns Data */}
                    {OPTIONAL_COLUMNS.filter(col => selectedColumns.includes(col.id)).map(col => {
                      switch (col.id) {
                        case 'progresso':
                          const progress = calculateProgress(course.startDate, course.expectedEndDate);
                          return (
                            <td key={col.id} className="px-4 py-2 whitespace-nowrap w-20 text-center">
                              <div className="w-full bg-slate-200 rounded-full h-2.5 min-w-[80px]">
                                <div 
                                  className="bg-indigo-600 h-2.5 rounded-full" 
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-500 mt-1 inline-block">{progress}%</span>
                            </td>
                          );
                        case 'sigo':
                          return <td key={col.id} className={tdClass}>{course.requiresSigo ? 'Sim' : 'Não'}</td>;
                        case 'descricaoFormacao':
                          return <td key={col.id} className={`${tdClass} max-w-[200px] truncate`} title={course.descricaoFormacao || ''}>{course.descricaoFormacao || '-'}</td>;
                        case 'lingua':
                          return <td key={col.id} className={tdClass}>{course.language}</td>;
                        case 'nivel':
                          return <td key={col.id} className={`${tdClass} w-20 text-center`}>{course.nivel}</td>;
                        case 'local':
                          return <td key={col.id} className={`${tdClass} max-w-[150px] truncate`} title={course.local}>{course.local}</td>;
                        case 'horarioDias':
                          return <td key={col.id} className={tdClass}>{course.schedule}</td>;
                        case 'horasFormador':
                          return <td key={col.id} className={`${tdClass} w-20 text-center`}>{course.horasFormador || 0}</td>;
                        case 'horasPlataforma':
                          return <td key={col.id} className={`${tdClass} w-20 text-center`}>{course.horasPlataforma || 0}</td>;
                        case 'horasTotais':
                          return <td key={col.id} className={`${tdClass} w-20 text-center`}>{(course.horasFormador || 0) + (course.horasPlataforma || 0)}</td>;
                        case 'formador':
                          return <td key={col.id} className={`${tdClass} max-w-[150px] truncate`} title={course.trainerName}>{course.trainerName}</td>;
                        case 'custoFormador':
                          return <td key={col.id} className={`${tdClass} w-20 text-center`}>{course.trainerCost}€</td>;
                        case 'estruturaCurso':
                          return <td key={col.id} className={tdClass}>{course.structure}</td>;
                        case 'responsavelRH':
                          const rh = course.audience === 'C' ? 'n/a' : (course.hrContact || '-');
                          return <td key={col.id} className={`${tdClass} max-w-[150px] truncate`} title={rh}>{rh}</td>;
                        case 'statusFaturacao': {
                          const parcelas = course.parcelas || [];
                          let status = 'Por Faturar';
                          let colorClass = 'bg-slate-100 text-slate-800';
                          
                          if (parcelas.length > 0) {
                            const allPaid = parcelas.every(p => p.estado === 'Paga');
                            const somePaidOrInvoiced = parcelas.some(p => p.estado === 'Paga' || p.estado === 'Faturada');
                            const allInvoicedOrPaid = parcelas.every(p => p.estado === 'Paga' || p.estado === 'Faturada');
                            
                            if (allPaid) {
                              status = 'Pago';
                              colorClass = 'bg-green-100 text-green-800';
                            } else if (allInvoicedOrPaid) {
                              status = 'Faturado Total';
                              colorClass = 'bg-blue-100 text-blue-800';
                            } else if (somePaidOrInvoiced) {
                              status = 'Faturado Parcial';
                              colorClass = 'bg-yellow-100 text-yellow-800';
                            }
                          }
                          
                          return <td key={col.id} className={tdClass}>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                              {status}
                            </span>
                          </td>;
                        }
                        default:
                          return <td key={col.id} className={tdClass}>-</td>;
                      }
                    })}
                  </tr>
                ))}
                {filteredCourses.length === 0 && (
                  <tr>
                    <td colSpan={5 + selectedColumns.length} className="px-6 py-8 text-center text-sm text-slate-500">
                      Nenhum curso encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CourseFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCourse}
        courses={courses}
      />
    </div>
  );
}
