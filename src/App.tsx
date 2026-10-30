/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { MarkEntryView } from './components/academics/MarkEntryView';
import { ReportCardView } from './components/reports/ReportCardView';
import { StudentListView } from './components/students/StudentListView';
import { FinanceView } from './components/finance/FinanceView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { TimetableView } from './components/timetable/TimetableView';
import { LibraryView } from './components/library/LibraryView';
import { StaffView } from './components/staff/StaffView';
import { CommunicationView } from './components/communication/CommunicationView';
import { ParentStudentPortal } from './components/portal/ParentStudentPortal';
import { SchoolSettingsView } from './components/settings/SchoolSettingsView';

const MainAppContent: React.FC = () => {
  const { currentUser, currentSchool } = useSchool();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // If user switches role to parent/student, suggest opening portal
  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView setCurrentTab={setCurrentTab} />;
      case 'academics':
        return <MarkEntryView />;
      case 'reports':
        return <ReportCardView />;
      case 'students':
        return <StudentListView onSelectStudentForReport={() => setCurrentTab('reports')} />;
      case 'finance':
        return <FinanceView />;
      case 'attendance':
        return <AttendanceView />;
      case 'timetable':
        return <TimetableView />;
      case 'library':
        return <LibraryView />;
      case 'staff':
        return <StaffView />;
      case 'communication':
        return <CommunicationView />;
      case 'portal':
        return <ParentStudentPortal onOpenReportCard={() => setCurrentTab('reports')} />;
      case 'settings':
        return <SchoolSettingsView />;
      default:
        return <DashboardView setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* 3-Zone Compliant Top Navigation Bar */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Workspace with Sidebar and Content Viewport */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {/* Role indication banner */}
          <div className="mb-4 flex items-center justify-between bg-white px-3.5 py-2 rounded-lg border border-slate-200 text-xs no-print">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Logged in as:</span>
              <strong className="text-slate-900 font-semibold">{currentUser.fullName}</strong>
              <span>·</span>
              <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded font-bold capitalize">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>

            <div className="text-[11px] text-slate-500">
              {currentSchool.name} · Uganda
            </div>
          </div>

          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainAppContent />
    </SchoolProvider>
  );
}
