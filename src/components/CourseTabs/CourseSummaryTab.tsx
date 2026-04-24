import React from 'react';
import { Course, CourseState } from '../../types';
import { Badge } from '../Badge';
import { 
  Loader2, Link as LinkIcon, Calendar, User, Building2, MapPin, 
  Languages, GraduationCap, Clock, Euro, ShieldCheck 
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { mockFormadores, mockEmpresas } from '../../services/dbService';

interface CourseSummaryTabProps {
  currentCourse: Course;
  isUpdatingStatus: boolean;
  COURSE_STATES: CourseState[];
  handleStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onEditCourse?: (course: Course) => void;
  onOpenCourseByRef?: (reference: string) => void;
}

export function CourseSummaryTab({
  currentCourse,
  isUpdatingStatus,
  COURSE_STATES,
  handleStatusChange,
  onEditCourse,
  onOpenCourseByRef
}: CourseSummaryTabProps) {
  return (
    <>
      {/* Status Management */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Gestão de Estado</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <select 
              value={currentCourse.state}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-500 transition-all"
            >
              {COURSE_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Read-only Info Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Resumo do Curso</h3>
          {onEditCourse && (
            <button
              onClick={() => onEditCourse(currentCourse)}
              className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-indigo-600 text-xs font-medium rounded hover:bg-indigo-50 transition-colors"
            >
              ✏️ Editar Dados do Curso
            </button>
          )}
        </div>
        <div className="p-5 space-y-6">
          
          {/* Grid Info */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div className="col-span-2">
              <label className="flex items-center text-slate-500 mb-1">
                <span className="text-xs font-medium uppercase">Descrição da Formação</span>
              </label>
              <div className="text-sm font-medium text-slate-900 pb-1">
                {currentCourse.descricaoFormacao || '-'}
              </div>
            </div>

            {currentCourse.previousCourseRef && (
              <div className="col-span-2 bg-indigo-50 border border-indigo-100 rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <LinkIcon className="h-4 w-4 text-indigo-500 mr-2" />
                  <span className="text-sm text-indigo-900">
                    <span className="font-semibold">Curso Anterior:</span>{' '}
                    <button 
                      onClick={() => {
                        if (onOpenCourseByRef) {
                          onOpenCourseByRef(currentCourse.previousCourseRef!);
                        }
                      }}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline font-mono"
                    >
                      {currentCourse.previousCourseRef}
                    </button>
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center text-slate-500 mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium uppercase">Data de Início</span>
              </label>
              <div className="text-sm font-medium text-slate-900 pb-1">
                {currentCourse.startDate ? formatDate(currentCourse.startDate) : '-'}
              </div>
            </div>

            <div>
              <label className="flex items-center text-slate-500 mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium uppercase">Data Fim Prevista</span>
              </label>
              <div className="text-sm font-medium text-slate-900 pb-1">
                {currentCourse.expectedEndDate ? formatDate(currentCourse.expectedEndDate) : '-'}
              </div>
            </div>

            <div>
              <label className="flex items-center text-slate-500 mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium uppercase">Data Conclusão Efetiva</span>
              </label>
              <div className="text-sm font-medium text-slate-900 pb-1">
                {currentCourse.dataConclusaoEfetiva ? formatDate(currentCourse.dataConclusaoEfetiva) : '-'}
              </div>
            </div>
            
            <div>
              <label className="flex items-center text-slate-500 mb-1">
                <User className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium uppercase">Coordenadora</span>
              </label>
              <div className="text-sm font-medium text-slate-900 pb-1">
                {currentCourse.coordenadora || '-'}
              </div>
            </div>

            <div>
              <div className="flex items-center text-slate-500 mb-1">
                <Building2 className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium uppercase">Cliente / Público</span>
              </div>
              <div className="text-sm font-medium text-slate-900 pb-1">
                {currentCourse.empresa || '-'}
              </div>
              
              {currentCourse.audience === 'B' && currentCourse.hrContact && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">DRH / Contacto RH</label>
                  <div className="text-sm font-medium text-slate-900 pb-1">
                    {currentCourse.hrContact}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center text-slate-500 mb-1">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium uppercase">Local</span>
              </label>
              <div className="text-sm font-medium text-slate-900 pb-1">
                {currentCourse.local || '-'}
              </div>
            </div>

            <div>
              <label className="flex items-center text-slate-500 mb-1">
                <Languages className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium uppercase">Língua</span>
              </label>
              <div className="text-sm font-medium text-slate-900 pb-1">
                {currentCourse.language || '-'}
              </div>
            </div>

            <div>
              <label className="flex items-center text-slate-500 mb-1">
                <GraduationCap className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium uppercase">Nível</span>
              </label>
              <div className="text-sm font-medium text-slate-900 pb-1">
                {currentCourse.nivel || '-'}
              </div>
            </div>

            <div>
              <label className="flex items-center text-slate-500 mb-1">
                <span className="text-xs font-medium uppercase">Modalidade</span>
              </label>
              <div className="text-sm font-medium text-slate-900 pb-1">
                {currentCourse.modalidade || '-'}
              </div>
            </div>

            <div className="col-span-2">
              <label className="flex items-center text-slate-500 mb-1">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium uppercase">Estrutura & Horário</span>
              </label>
              <div className="text-sm font-medium text-slate-900 pb-1 mb-2">
                {currentCourse.structure || '-'}
              </div>
              <div className="text-sm font-medium text-slate-600 pb-1">
                {currentCourse.schedule || '-'}
              </div>
            </div>

            <div className="col-span-2 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Horas c/ Formador</label>
                <div className="w-full bg-transparent border-b border-slate-300 text-sm font-medium text-slate-900 pb-1">
                  {currentCourse.horasFormador || 0}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Horas na Plataforma</label>
                <div className="w-full bg-transparent border-b border-slate-300 text-sm font-medium text-slate-900 pb-1">
                  {currentCourse.horasPlataforma || 0}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Horas Totais</label>
                <div className="w-full bg-transparent border-b border-slate-300 text-sm font-bold text-slate-900 pb-1">
                  {(currentCourse.horasFormador || 0) + (currentCourse.horasPlataforma || 0)}
                </div>
              </div>
            </div>

            <div className="col-span-2 pt-4 border-t border-slate-100">
              <label className="flex items-center text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase">Recursos</span>
              </label>
              <div className="text-sm font-medium text-slate-900 pb-1">
                {currentCourse.recursos || '-'}
              </div>
            </div>

            <div className="col-span-2 pt-4 border-t border-slate-100">
              <label className="flex items-center text-slate-500 mb-2">
                <span className="text-xs font-medium uppercase">Observações</span>
              </label>
              <div className="text-sm font-medium text-slate-900 pb-1">
                {currentCourse.observacoes || '-'}
              </div>
            </div>

            <div className="col-span-2 pt-4 border-t border-slate-100">
              <div className="flex items-center text-slate-500 mb-2">
                <Euro className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium uppercase">Formador & Custos</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex-1 mr-4">
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Nome do Formador</label>
                    <div className="w-full bg-transparent border-b border-slate-300 text-sm font-medium text-slate-900 pb-1">
                      {currentCourse.trainerName || '-'}
                    </div>
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Custo/Hora (€)</label>
                    <div className="w-full bg-transparent border-b border-slate-300 text-sm font-bold text-slate-900 pb-1 text-right">
                      {currentCourse.trainerCost || 0}
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={currentCourse.hasTutoring}
                      readOnly
                      disabled
                      className="h-4 w-4 text-indigo-600 border-slate-300 rounded opacity-50 cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-slate-900">Inclui Tutoria</span>
                  </label>
                  
                  {currentCourse.hasTutoring && (
                    <div className="ml-6 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Valor Total Tutoria (€)</label>
                        <div className="w-full bg-transparent border-b border-slate-300 text-sm text-slate-700 pb-1">
                          {currentCourse.valorTutoria || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Descrição / Formato de Pagamento</label>
                        <div className="w-full bg-transparent border border-slate-300 rounded-md text-sm text-slate-700 p-2 min-h-[60px]">
                          {currentCourse.descricaoTutoria || '-'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-2 pt-4 border-t border-slate-100">
              <label className="flex items-center text-slate-500 mb-1">
                <LinkIcon className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium uppercase">Link DTP</span>
              </label>
              <div className="text-sm text-indigo-600 pb-1">
                {currentCourse.dtpLink ? (
                  <a href={currentCourse.dtpLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {currentCourse.dtpLink}
                  </a>
                ) : (
                  '-'
                )}
              </div>
            </div>

            {/* Certificados */}
            <div className="col-span-2 pt-4 border-t border-slate-100">
              <div className="flex items-center text-slate-500 mb-4">
                <ShieldCheck className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium uppercase">Gestão de Certificados</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={currentCourse.requiresSigo}
                      readOnly
                      disabled
                      className="h-4 w-4 text-indigo-600 border-slate-300 rounded opacity-50 cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-slate-900">Requer SIGO</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Ação de Form. SIGO</label>
                  <div className="w-full bg-transparent border-b border-slate-300 text-sm font-medium text-slate-900 pb-1">
                    {currentCourse.sigoId || '-'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Data de Emissão (Linguagest)</label>
                  <div className="w-full bg-transparent border-b border-slate-300 text-sm font-medium text-slate-900 pb-1">
                    {currentCourse.dataEmissaoCertificados ? formatDate(currentCourse.dataEmissaoCertificados) : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Data de Envio ao RH</label>
                  <div className="w-full bg-transparent border-b border-slate-300 text-sm font-medium text-slate-900 pb-1">
                    {currentCourse.dataEnvioRH ? formatDate(currentCourse.dataEnvioRH) : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
