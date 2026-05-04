/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layout, TabType } from './components/Layout';
import { CoursesListView } from './views/CoursesListView';
import { ArchiveView } from './views/ArchiveView';
import { StudentsView } from './views/StudentsView';
import { TrainersView } from './views/TrainersView';
import { CompaniesView } from './views/CompaniesView';
import { BillingDashboardView } from './views/BillingDashboardView';
import { TrainerBillingView } from './views/TrainerBillingView';
import { SettingsView } from './views/SettingsView';
import { NotificationsView } from './views/NotificationsView';
import { checkAndUpdateCourseStatuses, getCourseById, getCourseByRef, updateCourseDetails, getActiveCourses } from './services/dbService';
import { CourseDetailsModal } from './components/CourseDetailsModal';
import { CourseFormModal } from './components/CourseFormModal';
import { Course, Role } from './types';

import { ToastProvider } from './contexts/ToastContext';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('lista_cursos');
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<Role>('COORDENACAO');
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCourseData, setEditCourseData] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    checkAndUpdateCourseStatuses().then(() => {
      setIsInitialized(true);
    });
    getActiveCourses().then(setCourses);
  }, [refreshTrigger]);

  const handleOpenCourse = async (courseId: string) => {
    const course = await getCourseById(courseId);
    if (course) {
      setSelectedCourse(course);
      setIsDetailsModalOpen(true);
    }
  };

  const handleOpenCourseByRef = async (reference: string) => {
    const course = await getCourseByRef(reference);
    if (course) {
      setSelectedCourse(course);
      setIsDetailsModalOpen(true);
    }
  };

  const handleDetailsUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditCourse = (course: Course) => {
    setEditCourseData(course);
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data: Omit<Course, 'id' | 'state'>) => {
    if (editCourseData) {
      await updateCourseDetails(editCourseData.id, data, 'Catarina Gomes');
      setIsEditModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
      handleOpenCourse(editCourseData.id);
    }
  };

  if (!isInitialized) return null;

  return (
    <ToastProvider>
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onOpenCourse={handleOpenCourse}
        currentUserRole={currentUserRole}
        setCurrentUserRole={setCurrentUserRole}
      >
        {activeTab === 'alunos_base' ? (
          <StudentsView />
        ) : activeTab === 'formadores_base' ? (
          <TrainersView />
        ) : activeTab === 'empresas_base' ? (
          <CompaniesView />
        ) : activeTab === 'arquivo' ? (
          <ArchiveView 
            refreshTrigger={refreshTrigger} 
            onOpenCourse={handleOpenCourse} 
          />
        ) : activeTab === 'faturacao' ? (
          <BillingDashboardView 
            refreshTrigger={refreshTrigger} 
            onOpenCourse={handleOpenCourse} 
          />
        ) : activeTab === 'honorarios' ? (
          <TrainerBillingView
            refreshTrigger={refreshTrigger}
          />
        ) : activeTab === 'configuracoes' ? (
          <SettingsView />
        ) : activeTab === 'notificacoes' ? (
          <NotificationsView 
            refreshTrigger={refreshTrigger}
            onOpenCourse={handleOpenCourse}
            currentUserRole={currentUserRole}
            onUpdate={handleDetailsUpdate}
          />
        ) : (
          <CoursesListView 
            activeTab={activeTab} 
            refreshTrigger={refreshTrigger} 
            onOpenCourse={handleOpenCourse} 
          />
        )}
        <CourseDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          course={selectedCourse}
          onUpdate={handleDetailsUpdate}
          onOpenCourseByRef={handleOpenCourseByRef}
          onEditCourse={handleEditCourse}
        />
        <CourseFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          courses={courses}
          initialData={editCourseData || undefined}
        />
      </Layout>
    </ToastProvider>
  );
}
