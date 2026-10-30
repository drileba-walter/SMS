/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { formatUGX } from '../../utils/unebGrading';
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  Download,
  Award,
  Calendar,
  CheckCircle,
  FileText,
} from 'lucide-react';

export const ReportCardView: React.FC = () => {
  const {
    currentSchool,
    classes,
    students,
    getClassTermReports,
    getStudentFeeSummary,
  } = useSchool();

  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.name || 'P.7');
  const [selectedStream, setSelectedStream] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Available streams for selected class
  const classObj = classes.find((c) => c.name === selectedClass);
  const streams = classObj ? ['All', ...classObj.streams] : ['All'];

  // All reports for this class/stream
  const classReports = useMemo(() => {
    return getClassTermReports(selectedClass, selectedStream);
  }, [getClassTermReports, selectedClass, selectedStream]);

  // Current report to render
  const currentReport = classReports[currentIndex] || classReports[0];

  const handleNext = () => {
    if (currentIndex < classReports.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const feeSummary = currentReport ? getStudentFeeSummary(currentReport.student.id) : null;

  return (
    <div className="space-y-6">
      {/* Top Filter and Navigation Bar (Hidden during print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedStream('All');
                  setCurrentIndex(0);
                }}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Stream
              </label>
              <select
                value={selectedStream}
                onChange={(e) => {
                  setSelectedStream(e.target.value);
                  setCurrentIndex(0);
                }}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                {streams.map((str) => (
                  <option key={str} value={str}>
                    {str}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Select Pupil / Student ({classReports.length} Available)
              </label>
              <select
                value={currentIndex}
                onChange={(e) => setCurrentIndex(parseInt(e.target.value, 10))}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 max-w-xs"
              >
                {classReports.map((rep, idx) => (
                  <option key={rep.student.id} value={idx}>
                    #{rep.classRank} - {rep.student.fullName} ({rep.student.stream})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors border border-slate-200"
              title="Previous Student"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-700 font-mono px-2">
              {currentIndex + 1} / {Math.max(1, classReports.length)}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex >= classReports.length - 1}
              className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors border border-slate-200"
              title="Next Student"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="ml-2 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print Official Report Card
            </button>
          </div>
        </div>
      </div>

      {!currentReport ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 text-xs">
          No student reports found for this class and stream combination.
        </div>
      ) : (
        /* OFFICIAL UGANDAN SCHOOL REPORT CARD (Styled for Screen & A4 Print) */
        <div className="bg-white max-w-4xl mx-auto p-8 rounded-xl shadow-md border border-slate-300 print-page text-slate-900 font-sans">
          {/* Header & Crest */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
                Republic of Uganda · Ministry of Education and Sports
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 my-2">
              {/* School Crest Shield */}
              <div className="w-16 h-16 rounded-full border-2 border-slate-900 bg-blue-900 text-amber-300 flex flex-col items-center justify-center font-bold text-xs uppercase tracking-tighter shrink-0 shadow-xs">
                <span>{currentSchool.name.substring(0, 3)}</span>
                <span className="text-[9px] text-white">UGANDA</span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900">
                  {currentSchool.name}
                </h1>
                <p className="text-xs italic font-serif text-slate-700">
                  "{currentSchool.motto}"
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {currentSchool.address}, {currentSchool.district} · Tel: {currentSchool.phone} · EMIS No: {currentSchool.emisNumber}
                </p>
              </div>
            </div>

            <div className="inline-block mt-2 px-6 py-1 bg-slate-100 border border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-900">
              Terminal Learner's Progress Report · Term {currentReport.term}, {currentReport.academicYear}
            </div>
          </div>

          {/* Student Biodata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 p-3 bg-slate-50 border border-slate-300 text-xs rounded-sm">
            <div>
              <span className="text-slate-500 font-medium">Pupil's Name:</span>
              <div className="font-bold text-slate-900 text-sm">{currentReport.student.fullName}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Admission No:</span>
              <div className="font-bold text-slate-900 font-mono">{currentReport.student.admissionNumber}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Class & Stream:</span>
              <div className="font-bold text-slate-900">
                {currentReport.student.className} {currentReport.student.stream}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Gender & Residence:</span>
              <div className="font-bold text-slate-900">
                {currentReport.student.gender} · {currentReport.student.residenceType}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Days Present:</span>
              <div className="font-bold text-slate-900">
                {currentReport.attendanceDaysPresent} / {currentReport.attendanceDaysTotal} Days
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">House:</span>
              <div className="font-bold text-slate-900">Cranes House</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Parent / Guardian:</span>
              <div className="font-bold text-slate-900">{currentReport.student.parentName}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Parent Phone:</span>
              <div className="font-bold text-slate-900 font-mono text-[11px]">{currentReport.student.parentPhone}</div>
            </div>
          </div>

          {/* Academic Results Table (UNEB Structure) */}
          <div className="my-4">
            <table className="w-full text-xs text-left border-collapse border border-slate-900">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-900 text-center">
                  <th className="border border-slate-900 py-1.5 px-3 text-left">Subject</th>
                  <th className="border border-slate-900 py-1.5 px-2 w-14">BOT (20%)</th>
                  <th className="border border-slate-900 py-1.5 px-2 w-14">MID (30%)</th>
                  <th className="border border-slate-900 py-1.5 px-2 w-14">EOT (50%)</th>
                  <th className="border border-slate-900 py-1.5 px-2 w-16">Total %</th>
                  <th className="border border-slate-900 py-1.5 px-2 w-14">Grade</th>
                  <th className="border border-slate-900 py-1.5 px-2 w-14">Points</th>
                  <th className="border border-slate-900 py-1.5 px-3 text-left">Teacher's Remarks</th>
                  <th className="border border-slate-900 py-1.5 px-2 w-12">Initials</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {currentReport.subjectResults.map((sub) => (
                  <tr key={sub.subjectCode} className="border-b border-slate-300">
                    <td className="border border-slate-900 py-1.5 px-3 font-semibold">
                      {sub.subjectName} ({sub.subjectCode})
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-center font-mono tabular-nums">
                      {sub.botMark ?? '-'}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-center font-mono tabular-nums">
                      {sub.midMark ?? '-'}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-center font-mono tabular-nums">
                      {sub.eotMark ?? '-'}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-center font-mono font-bold text-slate-900 tabular-nums">
                      {sub.finalMark}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-center font-bold text-blue-950">
                      {sub.grade}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-center font-mono font-semibold tabular-nums">
                      {sub.points}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-3 text-slate-700 italic text-[11px]">
                      {sub.remarks}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-center font-mono text-[10px] text-slate-600">
                      {sub.teacherInitials}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Performance Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 my-4 bg-blue-50 border border-blue-900 text-xs rounded-sm">
            <div className="text-center">
              <span className="text-slate-600 font-medium">Total Marks</span>
              <div className="font-extrabold text-slate-900 text-sm font-mono tabular-nums">
                {currentReport.totalMarks}
              </div>
            </div>
            <div className="text-center">
              <span className="text-slate-600 font-medium">Average Mark</span>
              <div className="font-extrabold text-slate-900 text-sm font-mono tabular-nums">
                {currentReport.averageMarks}%
              </div>
            </div>
            <div className="text-center">
              <span className="text-slate-600 font-medium">UNEB Aggregate</span>
              <div className="font-extrabold text-blue-950 text-base font-mono tabular-nums">
                {currentReport.aggregate}
              </div>
            </div>
            <div className="text-center">
              <span className="text-slate-600 font-medium">Division Placement</span>
              <div className="font-black text-blue-900 text-sm uppercase">
                {currentReport.division}
              </div>
            </div>
            <div className="text-center">
              <span className="text-slate-600 font-medium">Position in Class</span>
              <div className="font-extrabold text-slate-900 text-sm tabular-nums">
                {currentReport.classRank} out of {currentReport.totalInClass}
              </div>
            </div>
          </div>

          {/* Character & Conduct Rubric */}
          <div className="my-4 border border-slate-400 p-2.5 text-xs">
            <div className="font-bold uppercase text-slate-800 text-[11px] mb-1.5">
              Character & Conduct Assessment:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Punctuality:</span>{' '}
                <span className="font-semibold text-slate-900">Very Good</span>
              </div>
              <div>
                <span className="text-slate-500">Classroom Discipline:</span>{' '}
                <span className="font-semibold text-slate-900">Exemplary</span>
              </div>
              <div>
                <span className="text-slate-500">Hygiene & Uniform:</span>{' '}
                <span className="font-semibold text-slate-900">Smart & Tidy</span>
              </div>
              <div>
                <span className="text-slate-500">Co-Curricular / Games:</span>{' '}
                <span className="font-semibold text-slate-900">Athletics & Football</span>
              </div>
            </div>
          </div>

          {/* Teacher and Head Teacher Remarks */}
          <div className="space-y-3 my-4 text-xs">
            <div className="border border-slate-400 p-3 rounded-sm">
              <div className="font-bold uppercase text-slate-800 text-[11px]">
                Class Teacher's Remarks:
              </div>
              <p className="italic text-slate-800 mt-1 font-serif text-sm">
                "{currentReport.classTeacherRemarks}"
              </p>
              <div className="mt-2 text-right text-[11px] text-slate-600">
                Signature: _______________________ Date: 28th October 2026
              </div>
            </div>

            <div className="border-2 border-slate-900 p-3 rounded-sm bg-slate-50/50">
              <div className="font-bold uppercase text-slate-900 text-[11px]">
                Head Teacher's Comments & Official Endorsement:
              </div>
              <p className="italic text-slate-900 mt-1 font-serif text-sm">
                "{currentReport.headTeacherRemarks}"
              </p>

              <div className="flex items-end justify-between mt-4 pt-2 border-t border-slate-300">
                <div>
                  <div className="w-24 h-12 border-2 border-dashed border-blue-900/40 rounded flex items-center justify-center text-[9px] text-blue-900 font-bold uppercase tracking-wider text-center p-1">
                    [ OFFICIAL SCHOOL STAMP ]
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{currentSchool.headTeacherName}</div>
                  <div className="text-[10px] text-slate-500">{currentSchool.headTeacherSignatureTitle}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Term Fees & Resumption Circular Footer */}
          <div className="mt-4 pt-3 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-100 p-3">
            <div>
              <span className="text-slate-600 font-medium">Next Term Begins On:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {currentSchool.nextTermBeginsDate}
              </div>
            </div>
            <div>
              <span className="text-slate-600 font-medium">Next Term School Fees:</span>
              <div className="font-bold text-blue-900 text-sm font-mono mt-0.5 tabular-nums">
                {formatUGX(feeSummary?.totalBilled || 850000)}
              </div>
            </div>
            <div>
              <span className="text-slate-600 font-medium">Current Outstanding Balance:</span>
              <div className={`font-bold text-sm font-mono mt-0.5 tabular-nums ${feeSummary && feeSummary.balance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {feeSummary ? formatUGX(feeSummary.balance) : 'UGX 0'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
