/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import {
  UserPlus,
  Search,
  Download,
  Upload,
  ArrowUpRight,
  Filter,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Check,
  X,
  FileText,
} from 'lucide-react';

export const StudentListView: React.FC<{
  onSelectStudentForReport?: (studentId: string) => void;
}> = ({ onSelectStudentForReport }) => {
  const {
    currentSchool,
    classes,
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkAddStudents,
    promoteStudents,
  } = useSchool();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [streamFilter, setStreamFilter] = useState('All');
  const [residenceFilter, setResidenceFilter] = useState('All');

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Selection for bulk actions
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [promotionTargetClass, setPromotionTargetClass] = useState<string>(classes[1]?.name || 'P.7');

  // Form state for add/edit
  const [formData, setFormData] = useState<Partial<Student>>({
    fullName: '',
    admissionNumber: '',
    gender: 'Male',
    dateOfBirth: '2013-05-10',
    className: classes[0]?.name || 'P.7',
    stream: 'Blue',
    parentName: '',
    parentPhone: '+256 7',
    parentEmail: '',
    residenceType: 'Day',
    medicalNotes: '',
    status: 'Active',
  });

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.parentName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchClass = classFilter === 'All' || s.className === classFilter;
      const matchStream = streamFilter === 'All' || s.stream === streamFilter;
      const matchResidence = residenceFilter === 'All' || s.residenceType === residenceFilter;

      return matchSearch && matchClass && matchStream && matchResidence;
    });
  }, [students, searchTerm, classFilter, streamFilter, residenceFilter]);

  // Open add modal
  const handleOpenAdd = () => {
    setEditingStudent(null);
    const prefix = currentSchool.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase();
    setFormData({
      fullName: '',
      admissionNumber: `${prefix}/2026/${String(students.length + 1).padStart(3, '0')}`,
      gender: 'Male',
      dateOfBirth: '2013-06-15',
      className: classFilter !== 'All' ? classFilter : classes[0]?.name || 'P.7',
      stream: 'Blue',
      parentName: '',
      parentPhone: '+256 7',
      parentEmail: '',
      residenceType: 'Day',
      medicalNotes: '',
      status: 'Active',
      enrollmentDate: new Date().toISOString().split('T')[0],
    });
    setShowAddModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setShowAddModal(true);
  };

  // Save student
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.admissionNumber) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
    } else {
      addStudent({
        fullName: formData.fullName,
        admissionNumber: formData.admissionNumber,
        gender: formData.gender as 'Male' | 'Female',
        dateOfBirth: formData.dateOfBirth || '2013-01-01',
        className: formData.className || classes[0]?.name || 'P.7',
        stream: formData.stream || 'Blue',
        parentName: formData.parentName || 'Parent / Guardian',
        parentPhone: formData.parentPhone || '+256 700 000000',
        parentEmail: formData.parentEmail,
        residenceType: (formData.residenceType as 'Day' | 'Boarding') || 'Day',
        medicalNotes: formData.medicalNotes,
        enrollmentDate: formData.enrollmentDate || new Date().toISOString().split('T')[0],
        status: (formData.status as 'Active' | 'Alumni') || 'Active',
      });
    }
    setShowAddModal(false);
  };

  // Handle select all toggle
  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  // Handle single selection
  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle promotion execute
  const handleExecutePromotion = () => {
    if (selectedStudentIds.length === 0) return;
    promoteStudents(selectedStudentIds, promotionTargetClass);
    setSelectedStudentIds([]);
    setShowPromotionModal(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Admission No',
      'Full Name',
      'Gender',
      'Class',
      'Stream',
      'Residence',
      'Parent Name',
      'Parent Phone',
      'Status',
    ];
    const rows = filteredStudents.map((s) => [
      `"${s.admissionNumber}"`,
      `"${s.fullName}"`,
      `"${s.gender}"`,
      `"${s.className}"`,
      `"${s.stream}"`,
      `"${s.residenceType}"`,
      `"${s.parentName}"`,
      `"${s.parentPhone}"`,
      `"${s.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentSchool.name.replace(/\s+/g, '_')}_Student_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample CSV template import
  const [csvText, setCsvText] = useState(
    `AdmissionNumber,FullName,Gender,Class,Stream,Residence,ParentName,ParentPhone
KQA/2026/150,Kato Denis,Male,P.7,Blue,Day,Mrs. Prossy Kato,+256 772 119988
KQA/2026/151,Babirye Joan,Female,P.7,Blue,Boarding,Mr. Richard Babirye,+256 752 334455
KQA/2026/152,Mwesigwa Joshua,Male,P.6,Red,Day,Dr. Grace Mwesigwa,+256 701 556677`
  );

  const handleProcessCsvImport = () => {
    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) return;

    const newStudents: Omit<Student, 'id' | 'schoolId'>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length >= 8) {
        newStudents.push({
          admissionNumber: parts[0],
          fullName: parts[1],
          gender: parts[2] === 'Female' ? 'Female' : 'Male',
          className: parts[3] || 'P.7',
          stream: parts[4] || 'Blue',
          residenceType: parts[5] === 'Boarding' ? 'Boarding' : 'Day',
          parentName: parts[6] || 'Parent',
          parentPhone: parts[7] || '+256 700 000000',
          dateOfBirth: '2013-05-15',
          enrollmentDate: new Date().toISOString().split('T')[0],
          status: 'Active',
        });
      }
    }

    if (newStudents.length > 0) {
      bulkAddStudents(newStudents);
      setShowCsvModal(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
            Admissions & Student Registry
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Learner Directory ({filteredStudents.length} Students)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage bio-data, academic enrollment, class streams, and parent contacts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Bulk CSV Upload
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Enroll New Pupil
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student, admission no, parent..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="All">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Residence Filter */}
          <select
            value={residenceFilter}
            onChange={(e) => setResidenceFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="All">Day & Boarding</option>
            <option value="Day">Day Scholar</option>
            <option value="Boarding">Boarder</option>
          </select>

          {/* Promotion / Repetition Action Button */}
          {selectedStudentIds.length > 0 && (
            <button
              onClick={() => setShowPromotionModal(true)}
              className="px-3 py-1.5 bg-blue-900 text-white rounded-lg font-semibold flex items-center gap-1.5 text-xs shadow-xs"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Promote ({selectedStudentIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      filteredStudents.length > 0 &&
                      selectedStudentIds.length === filteredStudents.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-900 focus:ring-0"
                  />
                </th>
                <th className="py-2.5 px-3">Admission No</th>
                <th className="py-2.5 px-3">Pupil Name</th>
                <th className="py-2.5 px-3">Gender</th>
                <th className="py-2.5 px-3">Class & Stream</th>
                <th className="py-2.5 px-3">Residence</th>
                <th className="py-2.5 px-3">Parent / Guardian</th>
                <th className="py-2.5 px-3">Parent Phone</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No learners match the specified search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStudent(student.id)}
                          className="rounded border-slate-300 text-blue-900 focus:ring-0"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                        {student.admissionNumber}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {student.fullName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{student.gender}</td>
                      <td className="py-2.5 px-3 font-medium text-blue-950">
                        {student.className} {student.stream}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-medium ${
                            student.residenceType === 'Boarding'
                              ? 'text-indigo-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {student.residenceType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{student.parentName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                        {student.parentPhone}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1 text-slate-500 hover:text-blue-900 rounded hover:bg-slate-100"
                            title="Edit Student Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${student.fullName} from school database?`)) {
                                deleteStudent(student.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-700 rounded hover:bg-slate-100"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden text-xs">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">
                {editingStudent ? 'Edit Learner Profile' : 'Enroll New Pupil'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Learner's Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Mugisha Brian"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Admission Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.admissionNumber || ''}
                    onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                    placeholder="e.g. KQA/2026/014"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender || 'Male'}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Level *</label>
                  <select
                    value={formData.className || classes[0]?.name || 'P.7'}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stream *</label>
                  <input
                    type="text"
                    value={formData.stream || 'Blue'}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    placeholder="e.g. Blue / Red"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Residence Status</label>
                  <select
                    value={formData.residenceType || 'Day'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        residenceType: e.target.value as 'Day' | 'Boarding',
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  >
                    <option value="Day">Day Scholar</option>
                    <option value="Boarding">Boarding Student</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth || '2013-05-10'}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>

                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <div className="font-bold text-slate-800 mb-2">Parent / Guardian Contacts</div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent's Full Name</label>
                  <input
                    type="text"
                    value={formData.parentName || ''}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="e.g. Dr. Patrick Mugisha"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ugandan Phone No.</label>
                  <input
                    type="text"
                    value={formData.parentPhone || ''}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="+256 772 123456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Special Medical or Health Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.medicalNotes || ''}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    placeholder="e.g. Asthmatic inhaler with school dispensary"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingStudent ? 'Update Profile' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMOTION / REPETITION MODAL */}
      {showPromotionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 text-xs">
            <h2 className="font-bold text-slate-900 text-sm">
              Promote Selected Learners ({selectedStudentIds.length})
            </h2>
            <p className="text-slate-500 mt-1">
              Select target class level for the next academic year or mark as graduated alumni.
            </p>

            <div className="my-4">
              <label className="block font-semibold text-slate-700 mb-1">
                Target Destination Class
              </label>
              <select
                value={promotionTargetClass}
                onChange={(e) => setPromotionTargetClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    Promote to {c.name}
                  </option>
                ))}
                <option value="Alumni">Graduate to Alumni (Completed UNEB)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowPromotionModal(false)}
                className="px-3 py-1.5 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePromotion}
                className="px-4 py-1.5 bg-blue-900 text-white font-semibold rounded-lg shadow-xs"
              >
                Confirm Promotion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK CSV IMPORT MODAL */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full p-5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h2 className="font-bold text-slate-900 text-sm">
                Bulk Learner Enrollment via CSV
              </h2>
              <button onClick={() => setShowCsvModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 my-2">
              Paste comma-separated student data below following the standard format (AdmissionNumber, FullName, Gender, Class, Stream, Residence, ParentName, ParentPhone):
            </p>

            <textarea
              rows={7}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
            />

            <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-3 py-1.5 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessCsvImport}
                className="px-4 py-1.5 bg-blue-900 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Import & Enroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
