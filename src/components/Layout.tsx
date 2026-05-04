import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, FileText, LayoutDashboard, Settings, Users, GraduationCap, Archive, Bell, Check, Building, DownloadCloud, UploadCloud, Banknote, ChevronDown, LogOut } from 'lucide-react';
import { Notification, Role } from '../types';
import { getNotifications, markNotificationAsRead, exportDatabaseBackup, restoreDatabaseBackup } from '../services/dbService';

import { ErrorBoundary } from './ErrorBoundary';

export type TabType = 'lista_cursos' | 'faturacao' | 'honorarios' | 'arquivo' | 'alunos_base' | 'formadores_base' | 'empresas_base' | 'configuracoes' | 'notificacoes';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenCourse: (courseId: string) => void;
  currentUserRole: Role;
  setCurrentUserRole: (role: Role) => void;
}

export function Layout({ children, activeTab, onTabChange, onOpenCourse, currentUserRole, setCurrentUserRole }: LayoutProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(null);

  const handleExportBackup = () => {
    const jsonString = exportDatabaseBackup();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `linguagest_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingRestoreFile(file);
    setIsRestoreModalOpen(true);
  };

  const confirmRestore = () => {
    if (!pendingRestoreFile) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = restoreDatabaseBackup(content);
        if (success) {
          window.location.reload();
        } else {
          // Fallback if restore fails
          console.error("Erro ao restaurar o backup. Ficheiro inválido.");
        }
      }
    };
    reader.readAsText(pendingRestoreFile);
    setIsRestoreModalOpen(false);
    setPendingRestoreFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cancelRestore = () => {
    setIsRestoreModalOpen(false);
    setPendingRestoreFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const visibleNotifications = notifications.filter(n => 
    !n.read && (n.targetRoles.includes(currentUserRole) || n.targetRoles.includes('TODOS'))
  );

  const unreadCount = visibleNotifications.length;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'agora mesmo';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `há ${diffInDays} dias`;
  };

  const navGroups = [
    { id: 'lista_cursos', label: 'Cursos', icon: LayoutDashboard },
    {
      label: 'Financeiro',
      items: [
        { id: 'faturacao', label: 'Faturação', icon: FileText },
        { id: 'honorarios', label: 'Honorários', icon: Banknote },
      ]
    },
    {
      label: 'Bases de Dados',
      items: [
        { id: 'alunos_base', label: 'Alunos', icon: BookOpen },
        { id: 'formadores_base', label: 'Formadores', icon: Users },
        { id: 'empresas_base', label: 'Empresas', icon: Building },
      ]
    },
    { id: 'arquivo', label: 'Arquivo', icon: Archive },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            {/* Left side: Logo and Navigation */}
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center mr-8">
                <span className="text-xl font-bold text-slate-900">Linguagest</span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navGroups.map((group, idx) => {
                  if (group.items) {
                    const hasActiveItem = group.items.some(i => i.id === activeTab);
                    return (
                      <div key={idx} className="relative flex group">
                        <button
                          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                            hasActiveItem
                              ? 'border-indigo-500 text-slate-900'
                              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                          }`}
                        >
                          {group.label}
                          <ChevronDown className="h-4 w-4 ml-1 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </button>
                        
                        <div className="absolute top-full left-0 w-48 bg-white border border-slate-200 shadow-lg rounded-b-md rounded-tr-md py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                          {/* Invisible bridge to prevent hover loss */}
                          <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />
                          
                          {group.items.map((item) => {
                            const IconItem = item.icon;
                            let isActive = activeTab === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => onTabChange(item.id as TabType)}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors ${
                                  isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {IconItem && <IconItem className="h-4 w-4 mr-2" />}
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  const Icon = group.icon;
                  const isActive = activeTab === group.id;
                  return (
                    <button
                      key={group.id}
                      onClick={() => onTabChange(group.id as TabType)}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-indigo-500 text-slate-900'
                          : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4 mr-2" />}
                      {group.label}
                      {group.id === 'notificacoes' && unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right side: User Area & Settings */}
            <div className="flex items-center space-x-4">
              
              <div className="relative" ref={settingsRef}>
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isSettingsOpen ? 'bg-slate-100 text-slate-600' : 'text-slate-400 hover:text-slate-500 hover:bg-slate-100'}`}
                >
                  <Settings className="h-5 w-5" />
                </button>

                {isSettingsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sistema</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onTabChange('configuracoes');
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3 text-slate-400" />
                        Configurações Gerais
                      </button>
                      <button
                        onClick={() => {
                          setIsSettingsOpen(false);
                          handleExportBackup();
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors"
                      >
                        <DownloadCloud className="h-4 w-4 mr-3 text-slate-400" />
                        Fazer Backup (JSON)
                      </button>
                      <button
                        onClick={() => {
                          setIsSettingsOpen(false);
                          fileInputRef.current?.click();
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors"
                      >
                        <UploadCloud className="h-4 w-4 mr-3 text-slate-400" />
                        Restaurar Backup
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <div 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium cursor-pointer hover:bg-indigo-200 transition-colors"
                >
                  CG
                </div>

                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-sm border-slate-300 rounded-md py-1 font-semibold text-slate-900">Catarina Gomes</p>
                      <p className="text-xs text-slate-500 truncate">catarina@linguagest.pt</p>
                    </div>
                    
                    <div className="p-4 border-b border-slate-100">
                      <label htmlFor="role-simulator" className="block text-xs font-medium text-slate-500 mb-2">
                        O seu papel:
                      </label>
                      <select
                        id="role-simulator"
                        value={currentUserRole}
                        onChange={(e) => setCurrentUserRole(e.target.value as Role)}
                        className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1.5 pl-3 pr-8 bg-white text-slate-700"
                      >
                        <option value="COORDENACAO">Coordenação</option>
                        <option value="ADMINISTRATIVO">Administrativo</option>
                        <option value="SUPORTE">Suporte</option>
                        <option value="TODOS">Todos</option>
                      </select>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={() => {
                          console.log("Logout executado");
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors rounded-lg"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full mx-auto p-4 sm:p-6">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {/* Restore Confirmation Modal */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={cancelRestore} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Restaurar Backup</h3>
            <p className="text-sm text-slate-600 mb-6">
              Atenção: Isto vai apagar TODOS os dados atuais (Cursos, Alunos, Empresas) e restaurar a partir do ficheiro. Tem a certeza absoluta?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelRestore}
                className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRestore}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sim, Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
