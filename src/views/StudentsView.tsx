import React, { useEffect, useState } from 'react';
import { Student, Empresa, LANGUAGE_LEVELS } from '../types';
import { searchAlunos, getEmpresas, deleteAluno } from '../services/dbService';
import { Search, Loader2, Plus, Upload, Edit2, Eye, Trash2, AlertTriangle, Users } from 'lucide-react';
import { StudentProfileModal } from '../components/StudentProfileModal';
import { StudentFormModal } from '../components/StudentFormModal';
import { StudentImportModal } from '../components/StudentImportModal';
import { formatDate } from '../utils/dateUtils';

export function StudentsView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterNivel, setFilterNivel] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const fetchInitialData = async () => {
    try {
      const empresasData = await getEmpresas();
      setEmpresas(empresasData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() && !filterEmpresa && !filterNivel) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const results = await searchAlunos({
        searchTerm: searchQuery.trim(),
        empresa: filterEmpresa,
        nivel: filterNivel
      }, 50);
      setStudents(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = (student: Student) => {
    setSelectedStudent(student);
    setIsProfileModalOpen(true);
  };

  const handleOpenForm = (student?: Student) => {
    setSelectedStudent(student || null);
    setIsFormModalOpen(true);
  };

  const handleUpdate = () => {
    if (hasSearched) {
      handleSearch();
    }
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      await deleteAluno(studentToDelete.id);
      setStudentToDelete(null);
      if (hasSearched) {
        handleSearch();
      }
    } catch (error) {
      console.error('Failed to delete student', error);
    }
  };

  const getEmpresaName = (empresaId?: string) => {
    if (!empresaId) return '-';
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa ? empresa.nome : 'N/A';
  };

  return (
    <div className="max-w-full mx-auto pb-4">
      <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 flex-1 w-full max-w-4xl">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Pesquisar por nome, email ou nº..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            value={filterEmpresa}
            onChange={(e) => setFilterEmpresa(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <option value="">Todas as Empresas</option>
            <option value="C">Particular / B2C</option>
            {empresas.map(empresa => (
              <option key={empresa.id} value={empresa.id}>{empresa.nome}</option>
            ))}
          </select>

          <select
            value={filterNivel}
            onChange={(e) => setFilterNivel(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <option value="">Todos os Níveis</option>
            {LANGUAGE_LEVELS.map(nivel => (
              <option key={nivel} value={nivel}>{nivel}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading || (!searchQuery.trim() && !filterEmpresa && !filterNivel)}
            className="inline-flex justify-center items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Pesquisar
          </button>
        </form>

        <div className="flex space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Aluno
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : !hasSearched ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Search className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900">Pesquisa de Alunos</p>
            <p className="text-sm">Utilize a barra de pesquisa para encontrar alunos.</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Users className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900">Sem resultados</p>
            <p className="text-sm">Nenhum aluno encontrado para "{searchQuery}".</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nº Aluno</th>
                    <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                    <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Empresa</th>
                    <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nível Atual</th>
                    <th scope="col" className="px-6 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-slate-900 font-mono">
                        {student.numeroAluno || '-'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-slate-700">{student.nome}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-slate-500">{student.email}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-slate-500">
                        {getEmpresaName(student.empresaId)}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-slate-900 font-medium">
                        {student.niveis && student.niveis.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {student.niveis.map((nivel, idx) => (
                              <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {nivel}
                              </span>
                            ))}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-4">
                          <button 
                            onClick={() => handleOpenProfile(student)}
                            className="text-slate-500 hover:text-slate-700 focus:outline-none flex items-center"
                            title="Ver Perfil"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenForm(student)}
                            className="text-indigo-600 hover:text-indigo-900 focus:outline-none flex items-center"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(student)}
                            className="text-red-600 hover:text-red-900 focus:outline-none flex items-center"
                            title="Apagar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {students.length === 50 && (
              <div className="bg-amber-50 p-3 text-center border-t border-amber-100 mt-auto">
                <p className="text-sm text-amber-700">A mostrar os primeiros 50 resultados. Por favor, refine a sua pesquisa.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <StudentProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={selectedStudent}
        onUpdate={handleUpdate}
      />

      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        student={selectedStudent}
        onUpdate={handleUpdate}
      />

      <StudentImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onUpdate={handleUpdate}
      />

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setStudentToDelete(null)} />
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-in fade-in zoom-in-95 duration-200 p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 text-center mb-2">Apagar Aluno</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Tem a certeza que deseja apagar o aluno <strong>{studentToDelete.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStudentToDelete(null)}
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
