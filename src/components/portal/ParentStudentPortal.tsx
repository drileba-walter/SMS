/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { formatUGX } from '../../utils/unebGrading';
import {
  UserCheck2,
  Award,
  Calendar,
  Wallet,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Clock,
  Printer,
} from 'lucide-react';

export const ParentStudentPortal: React.FC<{
  onOpenReportCard?: () => void;
}> = ({ onOpenReportCard }) => {
  const {
    currentSchool,
    currentUser,
    students,
    payments,
    announcements,
    bookIssues,
    books,
    getStudentTermReport,
    getStudentFeeSummary,
  } = useSchool();

  // Child selection (defaults to linkedStudentId or first student)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentUser.linkedStudentId || students[0]?.id || ''
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const report = selectedStudent ? getStudentTermReport(selectedStudent.id) : null;
  const feeSummary = selectedStudent ? getStudentFeeSummary(selectedStudent.id) : null;

  // Student's payments
  const studentPayments = selectedStudent
    ? payments.filter((p) => p.studentId === selectedStudent.id)
    : [];

  // Student's borrowed books
  const studentLoans = selectedStudent
    ? bookIssues.filter((i) => i.borrowerId === selectedStudent.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 rounded-xl text-white shadow-xs border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              {currentUser.role === 'student' ? 'Learner Self-Service Portal' : 'Parent & Guardian Portal'}
            </div>
            <h1 className="text-xl font-bold mt-1 text-white">
              {selectedStudent ? selectedStudent.fullName : 'Learner Dashboard'}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Admission: {selectedStudent?.admissionNumber} · Class: {selectedStudent?.className}{' '}
              {selectedStudent?.stream} · {selectedStudent?.residenceType} Scholar
            </p>
          </div>

          {/* Child Switcher for Parents */}
          {students.length > 1 && (
            <div className="bg-blue-950/70 p-2 rounded-lg border border-blue-800/80 text-xs">
              <label className="block text-slate-300 font-medium mb-1">Select Learner:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-blue-900 text-white font-semibold rounded px-2.5 py-1 text-xs border border-blue-700"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.className} {s.stream})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Academic Aggregate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Term 2 UNEB Standing</span>
          <div className="text-xl font-extrabold text-blue-950 mt-1 font-mono tabular-nums">
            Aggregate {report?.aggregate || 4}
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">
            {report?.division || 'Division 1'} · Rank #{report?.classRank} in Class
          </div>
        </div>

        {/* Fees Balance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">School Fees Status</span>
          <div
            className={`text-xl font-bold mt-1 font-mono tabular-nums ${
              feeSummary && feeSummary.balance > 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {feeSummary ? formatUGX(feeSummary.balance) : 'UGX 0'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Status: <strong>{feeSummary?.status}</strong> (Paid {formatUGX(feeSummary?.totalPaid || 0)})
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Attendance Record</span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {report?.attendanceDaysPresent} / {report?.attendanceDaysTotal} Days
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {Math.round(((report?.attendanceDaysPresent || 62) / (report?.attendanceDaysTotal || 65)) * 100)}% Presence Rate
          </div>
        </div>
      </div>

      {/* Subject Grades Snapshot */}
      {report && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Current Term Academic Performance Summary
              </h2>
              <p className="text-xs text-slate-500">
                End of Term Results & UNEB Grading Breakdown
              </p>
            </div>
            {onOpenReportCard && (
              <button
                onClick={onOpenReportCard}
                className="text-xs font-semibold text-blue-900 hover:underline flex items-center gap-1"
              >
                View Full Printable Report Card <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {report.subjectResults.map((sub) => (
              <div
                key={sub.subjectCode}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs"
              >
                <div className="text-slate-500 font-medium">{sub.subjectName}</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-extrabold text-blue-950 font-mono tabular-nums">
                    {sub.finalMark}%
                  </span>
                  <span className="text-xs font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {sub.grade} ({sub.points} pts)
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 italic mt-1 truncate">
                  {sub.remarks}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fee Receipts & Library Loans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Receipts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Payment Receipts on File ({studentPayments.length})
          </h3>
          <div className="divide-y divide-slate-100 mt-3">
            {studentPayments.length === 0 ? (
              <div className="py-4 text-slate-400 text-center">No payment receipts recorded yet.</div>
            ) : (
              studentPayments.map((p) => (
                <div key={p.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <div className="font-mono font-bold text-blue-950">{p.receiptNumber}</div>
                    <div className="text-[11px] text-slate-500">
                      {p.paymentDate} · {p.paymentMethod}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-800">
                      {formatUGX(p.amountPaid)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.referenceNumber}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Library Loans */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Library Book Loans ({studentLoans.length})
          </h3>
          <div className="divide-y divide-slate-100 mt-3">
            {studentLoans.length === 0 ? (
              <div className="py-4 text-slate-400 text-center">No active library book loans.</div>
            ) : (
              studentLoans.map((l) => {
                const b = books.find((book) => book.id === l.bookId);
                return (
                  <div key={l.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{b?.title || 'Book Title'}</div>
                      <div className="text-[11px] text-slate-500">
                        Issued: {l.issueDate} · Due: {l.dueDate}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`font-semibold text-[11px] ${
                          l.status === 'Overdue'
                            ? 'text-rose-700 font-bold'
                            : l.status === 'Returned'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
