import React from 'react';
import { CourseState } from '../types';

interface BadgeProps {
  state: CourseState;
}

export function Badge({ state }: BadgeProps) {
  const getStyles = (state: CourseState) => {
    switch (state) {
      case 'PENDENTE':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'DTP CONCLUIDO':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FEITO':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'A DECORRER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'EM VALIDAÇÃO':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'VALIDADO':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'CERTIFICADO LINGUAGEST':
      case 'CERTIFICADOS ENVIADOS RH':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'CONCLUIDO':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'ANULADO':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles(state)}`}>
      {state}
    </span>
  );
}
