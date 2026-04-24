import React, { useEffect, useState, useMemo } from 'react';
import { Course, Lingua } from '../types';
import { getActiveCourses, createCourse, getLinguas } from '../services/dbService';
import { Badge } from '../components/Badge';
import { Loader2, Search, ChevronLeft, ChevronRight, CopyPlus } from 'lucide-react';
import { formatShortDate } from '../utils/dateUtils';
import { CourseFormModal } from '../components/CourseFormModal';

interface ArchiveViewProps {
  refreshTrigger: number;
  onOpenCourse: (courseId: string) => void;
}

export function ArchiveView({ refreshTrigger, onOpenCourse }: ArchiveViewProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchRef, setSearchRef] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterFormador, setFilterFormador] = useState('');
  const [filterLingua, setFilterLingua] = useState('');
  const [linguasList, setLinguasList] = useState<Lingua[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Continuation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [initialCourseData, setInitialCourseData] = useState<Partial<Course> | undefined>(undefined);

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
  }, [refreshTrigger]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchRef, filterEmpresa, filterFormador, filterLingua]);

  const archivedCourses = useMemo(() => {
    return courses.filter(course => course.state === 'CONCLUIDO' || course.state === 'ANULADO');
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return archivedCourses.filter(course => {
      if (searchRef && !course.reference.toLowerCase().includes(searchRef.toLowerCase())) {
        return false;
      }
      
      if (filterEmpresa) {
        const courseEmpresa = course.audience === 'C' ? 'Linguagest' : course.empresa;
        if (courseEmpresa !== filterEmpresa) return false;
      }

      if (filterFormador && course.trainerName !== filterFormador) {
        return false;
      }

      if (filterLingua) {
        const courseLang = course.language || '';
        if (!courseLang.toLowerCase().includes(filterLingua.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [archivedCourses, searchRef, filterEmpresa, filterFormador, filterLingua]);

  // Pagination logic
  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCourses, currentPage]);

  const handleCreateContinuation = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    
    const continuationData: Partial<Course> = {
      ...course,
      id: undefined, // CRUCIAL: Força o modo "Novo Curso" no modal
      reference: '', // Limpa para gerar uma nova
      state: 'PENDENTE',
      startDate: '',
      expectedEndDate: '',
      horasFormador: 0,
      horasPlataforma: 0,
      previousCourseRef: course.reference,
      dataConclusaoEfetiva: undefined,
      logs: []
    };
    
    setInitialCourseData(continuationData);
    setIsCreateModalOpen(true);
  };

  const handleCreateCourse = async (courseData: Omit<Course, 'id' | 'state'>) => {
    await createCourse(courseData);
    await fetchCourses();
  };

  const uniqueEmpresas = Array.from(new Set(archivedCourses.filter(c => c.audience === 'B').map(c => c.empresa))).filter(e => e && e !== 'Linguagest');
  const uniqueFormadores = Array.from(new Set(archivedCourses.map(c => c.trainerName))).filter(Boolean);

  const thClass = "px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap";
  const tdClass = "px-4 py-4 whitespace-nowrap text-sm text-slate-700";

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Arquivo</h1>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar Referência..."
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            className="pl-9 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
          />
        </div>

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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className={`${thClass} w-32`}>Referência</th>
                  <th scope="col" className={`${thClass} w-28 text-center`}>Data Início</th>
                  <th scope="col" className={`${thClass} w-28 text-center`}>Conclusão Efetiva</th>
                  <th scope="col" className={`${thClass} max-w-[150px]`}>Empresa</th>
                  <th scope="col" className={`${thClass} w-20 text-center`}>Nível</th>
                  <th scope="col" className={`${thClass} w-20 text-center`}>Hrs Totais</th>
                  <th scope="col" className={`${thClass} max-w-[150px]`}>Formador</th>
                  <th scope="col" className={`${thClass} max-w-[150px]`}>Responsável RH</th>
                  <th scope="col" className={`${thClass} w-16 text-center`}>Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginatedCourses.map((course) => (
                  <tr 
                    key={course.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onOpenCourse(course.id)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-slate-900 font-mono w-32">
                      {course.reference}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 w-28 text-center">
                      {formatShortDate(course.startDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 w-28 text-center">
                      {course.dataConclusaoEfetiva ? formatShortDate(course.dataConclusaoEfetiva) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 max-w-[150px] truncate" title={course.audience === 'C' ? 'Linguagest' : (course.empresa || 'Linguagest')}>
                      {course.audience === 'C' ? 'Linguagest' : (course.empresa || 'Linguagest')}
                    </td>
                    <td className={`${tdClass} w-20 text-center`}>{course.nivel}</td>
                    <td className={`${tdClass} w-20 text-center`}>{(course.horasFormador || 0) + (course.horasPlataforma || 0)}</td>
                    <td className={`${tdClass} max-w-[150px] truncate`} title={course.trainerName}>{course.trainerName}</td>
                    <td className={`${tdClass} max-w-[150px] truncate`} title={course.audience === 'C' ? 'n/a' : (course.hrContact || '-')}>{course.audience === 'C' ? 'n/a' : (course.hrContact || '-')}</td>
                    <td className={`${tdClass} w-16 text-center`}>
                      <button
                        onClick={(e) => handleCreateContinuation(e, course)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="Criar Continuação"
                      >
                        <CopyPlus className="h-5 w-5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedCourses.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-sm text-slate-500">
                      Nenhum curso encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {totalItems > 0 && (
            <div className="bg-white px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="font-medium">{totalItems}</span> resultados
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-700">
                    Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
                  </span>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      <span className="sr-only">Anterior</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      <span className="sr-only">Seguinte</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isCreateModalOpen && (
        <CourseFormModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setInitialCourseData(undefined);
          }}
          onSubmit={handleCreateCourse}
          courses={courses}
          initialData={initialCourseData}
        />
      )}
    </div>
  );
}

