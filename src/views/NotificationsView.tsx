import React, { useState, useEffect } from 'react';
import { Bell, Check, ArrowRight } from 'lucide-react';
import { Notification, Role } from '../types';
import { getNotifications, markNotificationAsRead } from '../services/dbService';

interface NotificationsViewProps {
  refreshTrigger: number;
  onOpenCourse: (courseId: string) => void;
  currentUserRole: Role;
  onUpdate: () => void;
}

export function NotificationsView({ refreshTrigger, onOpenCourse, currentUserRole, onUpdate }: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setLoading(false);
    };
    fetchNotifications();
  }, [refreshTrigger]);

  const handleMarkAsRead = async (notifId: string) => {
    await markNotificationAsRead(notifId);
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    onUpdate(); // tells Layout to fetch updated count too
  };

  const handleGoToCourse = (courseId: string) => {
    onOpenCourse(courseId);
  };

  const visibleNotifications = notifications.filter(n => 
    !n.read && (n.targetRoles.includes(currentUserRole) || n.targetRoles.includes('TODOS'))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'agora';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ontem';
    return `há ${diffInDays} dias`;
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString('pt-PT')} ${d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="max-w-7xl mx-auto pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Bell className="h-6 w-6 mr-2 text-indigo-600" />
            Notificações
          </h1>
          <p className="text-sm text-slate-500 mt-1">Avisos e alertas sobre os seus cursos</p>
        </div>
        {visibleNotifications.length > 0 && (
          <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
            {visibleNotifications.length} não {visibleNotifications.length === 1 ? 'lida' : 'lidas'}
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">A carregar notificações...</div>
        ) : visibleNotifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Tudo em dia!</h3>
            <p className="text-sm text-slate-500 mt-1">Não tem notificações pendentes de leitura.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Curso</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mensagem</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {visibleNotifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{formatDate(notif.createdAt)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{formatTimeAgo(notif.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 font-mono">
                        {notif.courseRef}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{notif.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleGoToCourse(notif.courseId)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-slate-300 shadow-sm text-xs font-medium rounded text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                          title="Ir para o Curso"
                        >
                          <ArrowRight className="h-4 w-4 mr-1.5" />
                          Ver Curso
                        </button>
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="inline-flex items-center p-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                          title="Marcar como Lido"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
