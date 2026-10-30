/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { formatUGX } from '../../utils/unebGrading';
import {
  Users,
  Award,
  Wallet,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setCurrentTab }) => {
  const {
    currentSchool,
    students,
    staff,
    payments,
    classes,
    feeStructures,
    announcements,
    getClassTermReports,
    currentUser,
  } = useSchool();

  // Metrics calculation
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Active').length;
  const totalStaff = staff.length;
  const teachersCount = staff.filter((s) => s.role === 'Teacher' || s.role === 'Head Teacher').length;

  // Candidate class for this school
  const candidateClass =
    currentSchool.levels.includes('primary')
      ? 'P.7'
      : currentSchool.levels.includes('o_level')
      ? 'S.4'
      : currentSchool.levels.includes('a_level')
      ? 'S.6'
      : 'Top Class';

  const candidateReports = getClassTermReports(candidateClass);
  const div1Count = candidateReports.filter((r) => r.division === 'Division 1').length;
  const div2Count = candidateReports.filter((r) => r.division === 'Division 2').length;
  const div3Count = candidateReports.filter((r) => r.division === 'Division 3').length;
  const div4Count = candidateReports.filter((r) => r.division === 'Division 4').length;
  const divUCount = candidateReports.filter((r) => r.division.includes('Division U')).length;

  // Fees calculation
  const totalCollectedUGX = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  // Estimate total expected fees
  let totalExpectedUGX = 0;
  students.forEach((s) => {
    const feeStructure = feeStructures.find((f) => f.className === s.className) || feeStructures[0];
    const amount =
      s.residenceType === 'Boarding'
        ? feeStructure?.totalBoardingAmount || 1200000
        : feeStructure?.totalDayAmount || 850000;
    totalExpectedUGX += amount;
  });

  const totalOutstandingUGX = Math.max(0, totalExpectedUGX - totalCollectedUGX);
  const collectionPercentage =
    totalExpectedUGX > 0 ? Math.round((totalCollectedUGX / totalExpectedUGX) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Ugandan School Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-xl text-white p-6 shadow-xs border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Uganda School Management System · EMIS #{currentSchool.emisNumber}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-white">
              {currentSchool.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 italic mt-0.5">
              "{currentSchool.motto}"
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300">
              <span className="bg-blue-800/80 px-2 py-0.5 rounded border border-blue-700/60 font-medium">
                Academic Year {currentSchool.currentAcademicYear}
              </span>
              <span>·</span>
              <span className="text-amber-300 font-medium">
                Term {currentSchool.currentTerm} of {currentSchool.termStructure}
              </span>
              <span>·</span>
              <span>Head Teacher: {currentSchool.headTeacherName}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setCurrentTab('academics')}
              className="px-3.5 py-2 text-xs font-semibold text-blue-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs"
            >
              Enter UNEB Marks
            </button>
            <button
              onClick={() => setCurrentTab('reports')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-700 rounded-lg transition-colors border border-blue-700"
            >
              Print Report Cards
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Pupil Enrolment</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {totalStudents}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {activeStudents} Active · {students.filter((s) => s.residenceType === 'Boarding').length} Boarders
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Staff & Teachers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Teaching & Support Staff</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {totalStaff}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {teachersCount} Teaching Staff · {totalStaff - teachersCount} Support
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Fees Collected */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Term {currentSchool.currentTerm} Fees Collected</div>
            <div className="text-lg font-bold text-emerald-700 mt-1 tabular-nums font-mono">
              {formatUGX(totalCollectedUGX)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {collectionPercentage}% of expected fees collected
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Candidate Class Performance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Candidate Class ({candidateClass})</div>
            <div className="text-2xl font-bold text-blue-900 mt-1 tabular-nums">
              {div1Count} <span className="text-xs text-slate-500 font-normal">in Division 1</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Out of {candidateReports.length} candidates evaluated
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Candidate UNEB Breakdown + Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* UNEB Candidate Performance Snapshot */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Candidate Class Academic Standing ({candidateClass} - Term {currentSchool.currentTerm})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                UNEB grading standards (PLE / UCE aggregate calculation)
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('reports')}
              className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
            >
              View Report Cards <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Division Distribution Bar & Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
            <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-lg text-center">
              <div className="text-xs font-bold text-blue-900">Division 1</div>
              <div className="text-xl font-bold text-blue-950 mt-1 tabular-nums">{div1Count}</div>
              <div className="text-[10px] text-blue-700 font-medium">Agg 4 – 12</div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-lg text-center">
              <div className="text-xs font-bold text-emerald-900">Division 2</div>
              <div className="text-xl font-bold text-emerald-950 mt-1 tabular-nums">{div2Count}</div>
              <div className="text-[10px] text-emerald-700 font-medium">Agg 13 – 24</div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-center">
              <div className="text-xs font-bold text-amber-900">Division 3</div>
              <div className="text-xl font-bold text-amber-950 mt-1 tabular-nums">{div3Count}</div>
              <div className="text-[10px] text-amber-700 font-medium">Agg 25 – 29</div>
            </div>

            <div className="p-3 bg-orange-50/70 border border-orange-200/60 rounded-lg text-center">
              <div className="text-xs font-bold text-orange-900">Division 4</div>
              <div className="text-xl font-bold text-orange-950 mt-1 tabular-nums">{div4Count}</div>
              <div className="text-[10px] text-orange-700 font-medium">Agg 30 – 33</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <div className="text-xs font-bold text-slate-800">Division U</div>
              <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{divUCount}</div>
              <div className="text-[10px] text-slate-600 font-medium">Ungraded</div>
            </div>
          </div>

          {/* Top Rankers Table */}
          <div className="mt-5">
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Top Ranked Learners in {candidateClass}:
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-y border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Rank</th>
                    <th className="py-2 px-3">Student Name</th>
                    <th className="py-2 px-3">Admission No</th>
                    <th className="py-2 px-3">Stream</th>
                    <th className="py-2 px-3 text-right">Aggregate</th>
                    <th className="py-2 px-3 text-right">Division</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidateReports.slice(0, 5).map((rep) => (
                    <tr key={rep.student.id} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 font-bold text-slate-800 tabular-nums">
                        #{rep.classRank}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {rep.student.fullName}
                      </td>
                      <td className="py-2 px-3 text-slate-500 font-mono">
                        {rep.student.admissionNumber}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {rep.student.stream}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-blue-950 font-mono tabular-nums">
                        {rep.aggregate}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className="font-semibold text-blue-900">
                          {rep.division}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Operations & Fees Snapshot */}
        <div className="space-y-6">
          {/* Fee collection progress */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Term 2 Fee Collection Status
            </h3>

            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>Collected</span>
                  <span className="font-mono tabular-nums text-emerald-700">
                    {formatUGX(totalCollectedUGX)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mt-1 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, collectionPercentage)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span>Outstanding Balances:</span>
                <span className="font-mono tabular-nums font-semibold text-rose-700">
                  {formatUGX(totalOutstandingUGX)}
                </span>
              </div>

              <button
                onClick={() => setCurrentTab('finance')}
                className="w-full mt-2 py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                Open Bursar Fee Ledger & Receipts
              </button>
            </div>
          </div>

          {/* School Circulars & Bulletins */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                School Bulletins
              </h3>
              <button
                onClick={() => setCurrentTab('communication')}
                className="text-[11px] font-semibold text-blue-900 hover:underline"
              >
                Send SMS / Notice
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {announcements.slice(0, 2).map((ann) => (
                <div key={ann.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div className="font-semibold text-slate-800">{ann.title}</div>
                  <div className="text-slate-600 line-clamp-2 mt-0.5">{ann.content}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Audience: {ann.targetAudience} · Posted {ann.postedDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Fee Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Fee Payments (UGX Receipts)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant receipts recorded via MTN MoMo, Airtel Money, Bank Deposit, or Cash
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('finance')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700"
          >
            Record New Payment
          </button>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Receipt No</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3">Reference / Slip</th>
                <th className="py-2.5 px-3 text-right">Amount (UGX)</th>
                <th className="py-2.5 px-3">Received By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.slice(0, 5).map((pay) => {
                const std = students.find((s) => s.id === pay.studentId);
                return (
                  <tr key={pay.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-900">
                      {pay.receiptNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {pay.paymentDate}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {std ? std.fullName : 'Student'} ({std?.className} {std?.stream})
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center text-slate-700 font-medium">
                        {pay.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {pay.referenceNumber}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                      {formatUGX(pay.amountPaid)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {pay.receivedBy}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
