/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import { School as SchoolIcon, UserCheck, ChevronDown, Check, LogOut, Menu, X, Globe } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const {
    currentSchool,
    schools,
    setCurrentSchoolId,
    currentUser,
    setCurrentUserRole,
  } = useSchool();

  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'head_teacher', label: 'Head Teacher / Principal', desc: 'Full academic oversight & approvals' },
    { role: 'teacher', label: 'Teacher', desc: 'Enters exam marks & class attendance' },
    { role: 'bursar', label: 'Bursar / Accountant', desc: 'Fee structures, MoMo/Bank receipts' },
    { role: 'librarian', label: 'Librarian', desc: 'Book catalog & loans tracking' },
    { role: 'school_admin', label: 'School Admin / Director', desc: 'School settings & staff assignments' },
    { role: 'parent', label: 'Parent / Guardian', desc: 'Portal: child reports & fee balances' },
    { role: 'student', label: 'Student', desc: 'Portal: results & timetable' },
    { role: 'super_admin', label: 'Super Admin (Ministry)', desc: 'Platform-level multi-school audit' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 md:gap-8">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 text-left text-slate-900 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-xs">
                CLS
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 leading-none whitespace-nowrap">
                  CoreLinkSchool
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5 whitespace-nowrap">
                  Uganda Education Portal
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`hover:text-blue-900 transition-colors whitespace-nowrap ${
                currentTab === 'dashboard' ? 'text-blue-900 font-semibold' : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('academics')}
              className={`hover:text-blue-900 transition-colors whitespace-nowrap ${
                currentTab === 'academics' ? 'text-blue-900 font-semibold' : ''
              }`}
            >
              UNEB Marks
            </button>
            <button
              onClick={() => setCurrentTab('reports')}
              className={`hover:text-blue-900 transition-colors whitespace-nowrap ${
                currentTab === 'reports' ? 'text-blue-900 font-semibold' : ''
              }`}
            >
              Report Cards
            </button>
            <button
              onClick={() => setCurrentTab('students')}
              className={`hover:text-blue-900 transition-colors whitespace-nowrap ${
                currentTab === 'students' ? 'text-blue-900 font-semibold' : ''
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setCurrentTab('finance')}
              className={`hover:text-blue-900 transition-colors whitespace-nowrap ${
                currentTab === 'finance' ? 'text-blue-900 font-semibold' : ''
              }`}
            >
              Fees & Finance
            </button>
          </nav>

          {/* Zone 3: Actions & School/Role Quick Switchers */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* School Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setSchoolDropdownOpen(!schoolDropdownOpen);
                  setRoleDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 whitespace-nowrap"
                title="Switch Active School (Multi-Tenant)"
              >
                <SchoolIcon className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span className="max-w-[130px] sm:max-w-[190px] truncate">
                  {currentSchool.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
              </button>

              {schoolDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-100 font-medium text-slate-500 uppercase tracking-wider text-[10px]">
                    Switch School (Multi-Tenant)
                  </div>
                  {schools.map((school) => (
                    <button
                      key={school.id}
                      onClick={() => {
                        setCurrentSchoolId(school.id);
                        setSchoolDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-start justify-between gap-2 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{school.name}</div>
                        <div className="text-[11px] text-slate-500">
                          EMIS: {school.emisNumber} · {school.district}
                        </div>
                      </div>
                      {school.id === currentSchool.id && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                  <div className="p-1.5 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSchoolDropdownOpen(false);
                        setCurrentTab('settings');
                      }}
                      className="w-full text-center py-1.5 text-xs text-blue-700 font-medium hover:bg-blue-50 rounded"
                    >
                      + Add New School Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setRoleDropdownOpen(!roleDropdownOpen);
                  setSchoolDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
                title="Switch User Role to test RBAC"
              >
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="capitalize hidden sm:inline">
                  {currentUser.role.replace('_', ' ')}
                </span>
                <span className="sm:hidden">Role</span>
                <ChevronDown className="w-3 h-3 text-blue-200 shrink-0" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-100 font-medium text-slate-500 uppercase tracking-wider text-[10px]">
                    Switch Perspective (8 RBAC Roles)
                  </div>
                  {roles.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        setCurrentUserRole(item.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-start justify-between gap-2 transition-colors ${
                        currentUser.role === item.role ? 'bg-blue-50/60' : ''
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{item.label}</div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                      {currentUser.role === item.role && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
