/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { CheckCircle2, XCircle, Clock, AlertCircle, Save, Calendar, UserCheck } from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    currentSchool,
    classes,
    students,
    staff,
    attendance,
    staffAttendance,
    saveDailyAttendance,
    markStaffAttendance,
  } = useSchool();

  const [attendanceTab, setAttendanceTab] = useState<'students' | 'staff'>('students');
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.name || 'P.7');
  const [selectedStream, setSelectedStream] = useState<string>('Blue');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Available streams for selected class
  const classObj = classes.find((c) => c.name === selectedClass);
  const streams = classObj ? classObj.streams : ['Blue'];

  // Students in this class & stream
  const classStudents = students.filter(
    (s) => s.className === selectedClass && s.stream === selectedStream && s.status === 'Active'
  );

  // Find existing record for this date & class
  const existingRecord = attendance.find(
    (a) =>
      a.className === selectedClass &&
      a.stream === selectedStream &&
      a.date === selectedDate &&
      a.schoolId === currentSchool.id
  );

  // Draft student attendance
  const [draftStatuses, setDraftStatuses] = useState<
    Record<string, { status: 'Present' | 'Absent' | 'Late' | 'Excused'; reason?: string }>
  >({});

  const [savedMessage, setSavedMessage] = useState(false);

  const getStudentStatus = (studentId: string) => {
    if (draftStatuses[studentId]) return draftStatuses[studentId].status;
    const found = existingRecord?.records.find((r) => r.studentId === studentId);
    return found ? found.status : 'Present';
  };

  const getStudentReason = (studentId: string) => {
    if (draftStatuses[studentId]?.reason !== undefined) return draftStatuses[studentId].reason;
    const found = existingRecord?.records.find((r) => r.studentId === studentId);
    return found?.reason || '';
  };

  const handleSetStatus = (
    studentId: string,
    status: 'Present' | 'Absent' | 'Late' | 'Excused'
  ) => {
    setDraftStatuses((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleSetReason = (studentId: string, reason: string) => {
    setDraftStatuses((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || getStudentStatus(studentId),
        reason,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: 'Present' | 'Absent' | 'Late' | 'Excused'; reason?: string }> = {};
    classStudents.forEach((s) => {
      updated[s.id] = { status: 'Present', reason: '' };
    });
    setDraftStatuses(updated);
  };

  const handleSaveAttendance = () => {
    const records = classStudents.map((s) => ({
      studentId: s.id,
      status: getStudentStatus(s.id),
      reason: getStudentReason(s.id),
    }));

    saveDailyAttendance(selectedClass, selectedStream, selectedDate, records);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
            Daily Registers & Roll-Call
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Attendance Tracking Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track daily learner class attendance and staff sign-in / sign-out logs
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setAttendanceTab('students')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              attendanceTab === 'students'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Learners Roll-Call
          </button>
          <button
            onClick={() => setAttendanceTab('staff')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              attendanceTab === 'staff'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Staff Sign-In Register
          </button>
        </div>
      </div>

      {attendanceTab === 'students' ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    const c = classes.find((cl) => cl.name === e.target.value);
                    if (c && c.streams.length > 0) setSelectedStream(c.streams[0]);
                    setDraftStatuses({});
                  }}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stream</label>
                <select
                  value={selectedStream}
                  onChange={(e) => {
                    setSelectedStream(e.target.value);
                    setDraftStatuses({});
                  }}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800"
                >
                  {streams.map((str) => (
                    <option key={str} value={str}>
                      {str}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg transition-colors border border-slate-200"
              >
                Mark All Present
              </button>
              <button
                onClick={handleSaveAttendance}
                className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                Save Roll-Call Register
              </button>
            </div>
          </div>

          {savedMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Attendance successfully recorded for {selectedClass} {selectedStream} on {selectedDate}!
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3">Admission No</th>
                    <th className="py-2.5 px-3">Learner Name</th>
                    <th className="py-2.5 px-3">Residence</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Reason for Absence / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No pupils enrolled in {selectedClass} {selectedStream}.
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((student, idx) => {
                      const status = getStudentStatus(student.id);
                      const reason = getStudentReason(student.id);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            {student.admissionNumber}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {student.fullName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {student.residenceType}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center gap-1">
                              {(['Present', 'Absent', 'Late', 'Excused'] as const).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleSetStatus(student.id, st)}
                                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                                    status === st
                                      ? st === 'Present'
                                        ? 'bg-emerald-700 text-white'
                                        : st === 'Absent'
                                        ? 'bg-rose-700 text-white'
                                        : st === 'Late'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-blue-800 text-white'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            {status !== 'Present' ? (
                              <input
                                type="text"
                                value={reason}
                                onChange={(e) => handleSetReason(student.id, e.target.value)}
                                placeholder="e.g. Malaria treatment, Fees balance, Heavy rain"
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-800"
                              />
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Normal attendance</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Staff Sign-in Tab */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900">
              Staff Daily Duty & Attendance Log · Today
            </span>
            <span className="text-slate-500 font-mono">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Staff Member</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Sign-In / Log Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((stf) => {
                  const today = new Date().toISOString().split('T')[0];
                  const record = staffAttendance.find(
                    (a) => a.staffId === stf.id && a.date === today
                  );

                  return (
                    <tr key={stf.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {stf.fullName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{stf.role}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                        {stf.phoneNumber}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-semibold text-xs ${
                            record?.status === 'Present'
                              ? 'text-emerald-700'
                              : record?.status === 'Absent'
                              ? 'text-rose-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {record?.status || 'Not Checked In'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => markStaffAttendance(stf.id, 'Present')}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                          >
                            Sign In (Present)
                          </button>
                          <button
                            onClick={() => markStaffAttendance(stf.id, 'Absent')}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200"
                          >
                            Mark Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
