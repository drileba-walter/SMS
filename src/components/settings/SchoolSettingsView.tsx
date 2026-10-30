/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { School, SchoolLevelType } from '../../types';
import {
  Building2,
  Save,
  Download,
  Upload,
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  School as SchoolIcon,
} from 'lucide-react';

export const SchoolSettingsView: React.FC = () => {
  const {
    currentSchool,
    schools,
    setCurrentSchoolId,
    updateSchoolProfile,
    addNewSchool,
    resetToDefaultData,
    exportDatabaseJson,
    importDatabaseJson,
  } = useSchool();

  // Local state for current school profile
  const [profile, setProfile] = useState<Partial<School>>({
    name: currentSchool.name,
    emisNumber: currentSchool.emisNumber,
    motto: currentSchool.motto,
    address: currentSchool.address,
    district: currentSchool.district,
    phone: currentSchool.phone,
    email: currentSchool.email,
    headTeacherName: currentSchool.headTeacherName,
    headTeacherSignatureTitle: currentSchool.headTeacherSignatureTitle,
    currentAcademicYear: currentSchool.currentAcademicYear,
    currentTerm: currentSchool.currentTerm,
    nextTermBeginsDate: currentSchool.nextTermBeginsDate,
  });

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // New School Modal state
  const [showNewSchoolModal, setShowNewSchoolModal] = useState(false);
  const [newSchoolData, setNewSchoolData] = useState({
    name: '',
    emisNumber: '0' + Math.floor(Math.random() * 89999 + 10000),
    motto: 'Excellence in Service and Integrity',
    levels: ['primary'] as SchoolLevelType[],
    termStructure: 3 as 2 | 3,
    currentAcademicYear: '2026',
    currentTerm: 2 as 1 | 2 | 3,
    badgeColor: 'blue',
    address: 'Plot 5 Main Street',
    district: 'Jinja',
    phone: '+256 700 123 456',
    email: 'admin@school.ac.ug',
    headTeacherName: 'Mr. Okot Michael',
    headTeacherSignatureTitle: 'Head Teacher (Dip. Ed, B.Ed)',
    nextTermBeginsDate: '14th September 2026',
  });

  // Handle save profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(profile);
    setSavedNotice('School configuration successfully updated!');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  // Handle register new school
  const handleCreateNewSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolData.name) return;
    addNewSchool(newSchoolData);
    setShowNewSchoolModal(false);
    setSavedNotice(`New school "${newSchoolData.name}" created and switched to active!`);
    setTimeout(() => setSavedNotice(null), 4000);
  };

  // Export JSON file
  const handleExportJson = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CoreLinkSchool_Backup_${currentSchool.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseJson(content);
        if (success) {
          setSavedNotice('Backup database successfully restored!');
          setTimeout(() => setSavedNotice(null), 3000);
        } else {
          alert('Failed to parse the imported JSON backup file.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
            System Administration & School Setup
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            School Configuration & Multi-Tenancy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure UNEB accreditation details, EMIS registration, term dates, and system backups
          </p>
        </div>

        <button
          onClick={() => setShowNewSchoolModal(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Onboard New School (Multi-Tenant)
        </button>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {savedNotice}
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-900" />
          Active Institution Profile: {currentSchool.name}
        </h2>

        <form onSubmit={handleSaveProfile} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Official School Name *
              </label>
              <input
                type="text"
                required
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Uganda EMIS Identification Number *
              </label>
              <input
                type="text"
                required
                value={profile.emisNumber || ''}
                onChange={(e) => setProfile({ ...profile, emisNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                School Motto / Slogan
              </label>
              <input
                type="text"
                value={profile.motto || ''}
                onChange={(e) => setProfile({ ...profile, motto: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                District / Municipality
              </label>
              <input
                type="text"
                value={profile.district || ''}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Physical Campus Address
              </label>
              <input
                type="text"
                value={profile.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Telephone</label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Head Teacher / Principal Full Name *
              </label>
              <input
                type="text"
                required
                value={profile.headTeacherName || ''}
                onChange={(e) => setProfile({ ...profile, headTeacherName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Head Teacher Designation / Qualifications
              </label>
              <input
                type="text"
                value={profile.headTeacherSignatureTitle || ''}
                onChange={(e) =>
                  setProfile({ ...profile, headTeacherSignatureTitle: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Active Academic Year
              </label>
              <input
                type="text"
                value={profile.currentAcademicYear || '2026'}
                onChange={(e) => setProfile({ ...profile, currentAcademicYear: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active Term</label>
              <select
                value={profile.currentTerm || 2}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    currentTerm: parseInt(e.target.value, 10) as 1 | 2 | 3,
                  })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
              >
                <option value={1}>Term 1</option>
                <option value={2}>Term 2</option>
                <option value={3}>Term 3</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Next Term Resumption Date
              </label>
              <input
                type="text"
                value={profile.nextTermBeginsDate || '14th September 2026'}
                onChange={(e) => setProfile({ ...profile, nextTermBeginsDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Backup, Restore & Demo Reset Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 text-xs">
        <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Database Backup, Data Portability & Demo Recovery
        </h2>
        <p className="text-slate-500 my-2">
          Export your entire multi-school tenant database to an offline JSON backup or reset to realistic Ugandan demonstration data.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            onClick={handleExportJson}
            className="px-4 py-2 font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-blue-900" />
            Download Full JSON Backup
          </button>

          <label className="px-4 py-2 font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-700" />
            Restore Database from JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (confirm('Reset all schools, marks, students, and fees to the default Ugandan demo dataset?')) {
                resetToDefaultData();
              }
            }}
            className="px-4 py-2 font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 flex items-center gap-1.5 ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Uganda Default Data
          </button>
        </div>
      </div>

      {/* NEW SCHOOL MODAL */}
      {showNewSchoolModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 text-xs">
            <h2 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <SchoolIcon className="w-4 h-4 text-blue-900" />
              Onboard New School (Multi-Tenant)
            </h2>

            <form onSubmit={handleCreateNewSchool} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">School Name *</label>
                <input
                  type="text"
                  required
                  value={newSchoolData.name}
                  onChange={(e) => setNewSchoolData({ ...newSchoolData, name: e.target.value })}
                  placeholder="e.g. Masaka Secondary School"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">EMIS Number</label>
                  <input
                    type="text"
                    value={newSchoolData.emisNumber}
                    onChange={(e) =>
                      setNewSchoolData({ ...newSchoolData, emisNumber: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={newSchoolData.district}
                    onChange={(e) =>
                      setNewSchoolData({ ...newSchoolData, district: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  School Levels Offered
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(['nursery', 'primary', 'o_level', 'a_level'] as SchoolLevelType[]).map((lvl) => {
                    const isChecked = newSchoolData.levels.includes(lvl);
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => {
                          const updated = isChecked
                            ? newSchoolData.levels.filter((l) => l !== lvl)
                            : [...newSchoolData.levels, lvl];
                          if (updated.length > 0) {
                            setNewSchoolData({ ...newSchoolData, levels: updated });
                          }
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-semibold capitalize border ${
                          isChecked
                            ? 'bg-blue-900 text-white border-blue-900'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {lvl.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Head Teacher / Principal Name
                </label>
                <input
                  type="text"
                  value={newSchoolData.headTeacherName}
                  onChange={(e) =>
                    setNewSchoolData({ ...newSchoolData, headTeacherName: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewSchoolModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 text-white font-bold rounded-lg shadow-xs"
                >
                  Create School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
