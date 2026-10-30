/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Staff } from '../../types';
import { UserCheck, UserPlus, Mail, Phone, BookOpen, Trash2, Edit2, X, Plus } from 'lucide-react';

export const StaffView: React.FC = () => {
  const { currentSchool, staff, subjects, classes, addStaff, updateStaff, deleteStaff } = useSchool();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState<Partial<Staff>>({
    fullName: '',
    role: 'Teacher',
    phoneNumber: '+256 7',
    email: '',
    employmentType: 'Full-time',
    qualification: 'Dip. Ed Kyambogo',
    subjectsTaught: ['ENG'],
    classesAssigned: ['P.7 Blue'],
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      fullName: '',
      role: 'Teacher',
      phoneNumber: '+256 7',
      email: '',
      employmentType: 'Full-time',
      qualification: 'B.Ed Makerere University',
      subjectsTaught: [subjects[0]?.code || 'ENG'],
      classesAssigned: [classes[0]?.name ? `${classes[0].name} Blue` : 'P.7 Blue'],
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (stf: Staff) => {
    setEditingStaff(stf);
    setFormData(stf);
    setShowAddModal(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) return;

    if (editingStaff) {
      updateStaff(editingStaff.id, formData);
    } else {
      addStaff({
        fullName: formData.fullName,
        role: formData.role || 'Teacher',
        phoneNumber: formData.phoneNumber || '+256 700 000000',
        email: formData.email || '',
        employmentType: formData.employmentType || 'Full-time',
        qualification: formData.qualification || 'Educator',
        subjectsTaught: formData.subjectsTaught || [],
        classesAssigned: formData.classesAssigned || [],
        joiningDate: new Date().toISOString().split('T')[0],
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
            Faculty & Non-Teaching Human Resources
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Staff & Educator Management ({staff.length} Members)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign curriculum subjects and classes to teachers and manage contact profiles
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((stf) => (
          <div
            key={stf.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{stf.fullName}</h3>
                  <div className="text-xs text-blue-900 font-semibold mt-0.5">{stf.role}</div>
                  <div className="text-[11px] text-slate-500">{stf.employmentType}</div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(stf)}
                    className="p-1 text-slate-400 hover:text-blue-900 rounded"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${stf.fullName}?`)) deleteStaff(stf.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-700 rounded"
                    title="Delete Staff"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="my-3 py-2 border-y border-slate-100 text-xs space-y-1">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-[11px]">{stf.phoneNumber}</span>
                </div>
                {stf.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-[11px]">{stf.email}</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-500 pt-1">
                  <span className="font-semibold text-slate-700">Qualification:</span>{' '}
                  {stf.qualification}
                </div>
              </div>

              {/* Teaching Assignments */}
              {stf.subjectsTaught.length > 0 && (
                <div className="text-xs">
                  <div className="text-[11px] font-semibold text-slate-700 mb-1">
                    Subjects & Classes:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {stf.subjectsTaught.map((sub) => (
                      <span
                        key={sub}
                        className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold"
                      >
                        {sub}
                      </span>
                    ))}
                    {stf.classesAssigned.map((cls) => (
                      <span
                        key={cls}
                        className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded text-[10px] font-semibold"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
              Joined on {stf.joiningDate}
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden text-xs">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">
                {editingStaff ? 'Edit Staff Profile' : 'Add Staff Member'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-5 space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Mr. Okello Peter"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={formData.role || 'Teacher'}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as Staff['role'] })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900"
                  >
                    <option value="Teacher">Teacher / Educator</option>
                    <option value="Head Teacher">Head Teacher / Principal</option>
                    <option value="Deputy Head Teacher">Deputy Head Teacher</option>
                    <option value="Bursar">Bursar / Accountant</option>
                    <option value="Librarian">Librarian</option>
                    <option value="Nurse">School Nurse / Medical</option>
                    <option value="Support Staff">Support Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment</label>
                  <select
                    value={formData.employmentType || 'Full-time'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentType: e.target.value as Staff['employmentType'],
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ugandan Phone No.</label>
                <input
                  type="text"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+256 772 000 000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="teacher@school.ac.ug"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Qualification</label>
                <input
                  type="text"
                  value={formData.qualification || ''}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. Dip. Ed Kyambogo, B.Ed Makerere"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
