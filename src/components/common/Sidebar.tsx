/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  Award,
  Wallet,
  CalendarCheck,
  Clock,
  BookOpen,
  Briefcase,
  Bell,
  UserCheck2,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { currentSchool, currentUser } = useSchool();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'academics', label: 'UNEB Mark Entry', icon: FileCheck2 },
    { id: 'reports', label: 'Report Cards & PLE', icon: Award },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'finance', label: 'Fees & Finance', icon: Wallet },
    { id: 'attendance', label: 'Attendance Register', icon: CalendarCheck },
    { id: 'timetable', label: 'Class Timetable', icon: Clock },
    { id: 'library', label: 'Library Catalog', icon: BookOpen },
    { id: 'staff', label: 'Staff Management', icon: Briefcase },
    { id: 'communication', label: 'Notices & SMS', icon: Bell },
    { id: 'portal', label: 'Parent/Student Portal', icon: UserCheck2 },
    { id: 'settings', label: 'School Settings', icon: Settings },
  ];

  const handleSelect = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-slate-800 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Active school banner in sidebar */}
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <div className="text-xs font-semibold text-white truncate">{currentSchool.name}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              EMIS: {currentSchool.emisNumber} · Year {currentSchool.currentAcademicYear}
            </div>
            <div className="text-[11px] text-amber-400 font-medium mt-1">
              Active Term {currentSchool.currentTerm} of {currentSchool.termStructure}
            </div>
          </div>

          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-blue-800 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User profile & footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="text-white font-medium truncate text-xs">{currentUser.fullName}</div>
              <div className="text-[10px] text-amber-400 capitalize font-medium truncate">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
