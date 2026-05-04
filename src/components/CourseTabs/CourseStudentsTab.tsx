import React, { useState, useRef, useEffect } from 'react';
import { Course, Student } from '../../types';
import { Plus, X, Loader2, Trash2 } from 'lucide-react';
import { enrollStudent, unenrollStudent, toggleStudentPayment } from '../../services/dbService';
import { useToast } from '../../contexts/ToastContext';

interface CourseStudentsTabProps {
  currentCourse: Course;
  students: Student[];
  onUpdate: () => void;
  setCurrentCourse: (course: Course) => void;
}

export function CourseStudentsTab({
  currentCourse,
  students,
  onUpdate,
  setCurrentCourse
}: CourseStudentsTabProps) {
  const { showToast } = useToast();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAlunos = students
    .filter((s) => {
      const term = searchTerm.toLowerCase();
      return (
        s.nome.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        (s.numeroAluno && s.numeroAluno.toLowerCase().includes(term))
      );
    })
    .slice(0, 10);

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCourse) return;

    setIsEnrolling(true);
    try {
      if (!selectedStudentId) {
        setIsEnrolling(false);
        return;
      }

      const currentUser = 'Catarina Gomes';
      const updatedCourse = await enrollStudent(currentCourse.id, selectedStudentId, currentUser);
      setCurrentCourse(updatedCourse);
      setShowEnrollForm(false);
      setSelectedStudentId('');
      setSearchTerm('');
      onUpdate();
      showToast('Aluno inscrito com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to enroll student', error);
      showToast('Erro ao inscrever aluno.', 'error');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenrollConfirm = async () => {
    if (!currentCourse || !studentToRemove) return;
    
    setIsUnenrolling(true);
    try {
      const currentUser = 'Catarina Gomes';
      const updatedCourse = await unenrollStudent(currentCourse.id, studentToRemove.id, currentUser);
      setCurrentCourse(updatedCourse);
      setStudentToRemove(null);
      onUpdate();
      showToast('Inscrição removida com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to unenroll student', error);
      showToast('Erro ao remover inscrição do aluno.', 'error');
    } finally {
      setIsUnenrolling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Alunos Inscritos</h3>
        {!showEnrollForm && (
          <button
            onClick={() => setShowEnrollForm(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Inscrever Aluno
          </button>
        )}
      </div>

      {/* Enroll Form */}
      {showEnrollForm && (
        <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold text-slate-900">Nova Inscrição</h4>
            <button onClick={() => setShowEnrollForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <form onSubmit={handleEnrollStudent} className="space-y-4">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-medium text-slate-700 mb-1">Selecionar Aluno</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                  setSelectedStudentId(''); // Clear selection when typing
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Pesquisar por nome, email ou nº..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required={!selectedStudentId} // Require selection, not just text
              />
              
              {isDropdownOpen && filteredAlunos.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredAlunos.map((s) => (
                    <li
                      key={s.id}
                      onClick={() => {
                        setSelectedStudentId(s.id);
                        setSearchTerm(s.nome);
                        setIsDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                    >
                      <div className="text-sm font-medium text-slate-900">
                        {s.numeroAluno ? <span className="text-slate-500 mr-2 font-mono text-xs">{s.numeroAluno}</span> : null}
                        {s.nome}
                      </div>
                      <div className="text-xs text-slate-500">{s.email}</div>
                    </li>
                  ))}
                </ul>
              )}
              
              {isDropdownOpen && searchTerm && filteredAlunos.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg p-4 text-center text-sm text-slate-500">
                  Nenhum aluno encontrado.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isEnrolling || !selectedStudentId}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isEnrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Adicionar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {(!currentCourse.enrolledStudents || currentCourse.enrolledStudents.length === 0) ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Nenhum aluno inscrito neste curso.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nº Aluno</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                {(currentCourse.empresa === 'Linguagest' || !currentCourse.empresa || currentCourse.audience === 'C') && (
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Pago?</th>
                )}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {currentCourse.enrolledStudents.map(studentId => {
                const student = students.find(s => s.id === studentId);
                if (!student) return null;
                const isPaid = currentCourse.pagamentosAlunos?.[student.id] || false;
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 font-mono">{student.numeroAluno}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{student.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.email}</td>
                    {(currentCourse.empresa === 'Linguagest' || !currentCourse.empresa || currentCourse.audience === 'C') && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={isPaid}
                          onChange={async () => {
                            try {
                              const updatedCourse = await toggleStudentPayment(currentCourse.id, student.id, isPaid, 'Catarina Gomes');
                              setCurrentCourse(updatedCourse);
                              onUpdate();
                              showToast(isPaid ? 'Pagamento marcado como pendente.' : 'Pagamento confirmado.', 'success');
                            } catch (error) {
                              console.error('Failed to toggle payment', error);
                              showToast('Erro ao atualizar estado de pagamento.', 'error');
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setStudentToRemove(student)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                        title="Remover Inscrição"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal for Removing Student */}
      {studentToRemove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setStudentToRemove(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Remover Inscrição</h3>
            <p className="text-sm text-slate-600 mb-6">
              Tem a certeza que pretende remover o aluno <span className="font-semibold text-slate-900">{studentToRemove.nome}</span> deste curso? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStudentToRemove(null)}
                disabled={isUnenrolling}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUnenrollConfirm}
                disabled={isUnenrolling}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isUnenrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
