/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ExamType, SchoolLevelType } from '../../types';
import { getGradeForLevel } from '../../utils/unebGrading';
import {
  Save,
  Sparkles,
  Download,
  Filter,
  CheckCircle,
  Table as TableIcon,
  Edit3,
  Award,
} from 'lucide-react';

export const MarkEntryView: React.FC = () => {
  const {
    currentSchool,
    classes,
    subjects,
    students,
    marks,
    recordMark,
    batchSaveMarks,
    getClassTermReports,
  } = useSchool();

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.name || 'P.7');
  const [selectedStream, setSelectedStream] = useState<string>('All');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(subjects[0]?.code || 'ENG');
  const [selectedExamType, setSelectedExamType] = useState<ExamType>('EOT');
  const [viewMode, setViewMode] = useState<'subject_entry' | 'broadsheet'>('subject_entry');

  // Local draft marks before batch save
  const [draftMarks, setDraftMarks] = useState<Record<string, number>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Available streams for selected class
  const classObj = classes.find((c) => c.name === selectedClass);
  const streams = classObj ? ['All', ...classObj.streams] : ['All'];
  const currentLevel: SchoolLevelType = classObj?.level || 'primary';

  // Available subjects for this level
  const availableSubjects = subjects.filter((s) => s.level === currentLevel);

  // Selected subject object
  const currentSubject = availableSubjects.find((s) => s.code === selectedSubjectCode) || availableSubjects[0];

  // Eligible students for the selected class and stream
  const eligibleStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = s.className === selectedClass && s.status === 'Active';
      const matchStream = selectedStream === 'All' || s.stream === selectedStream;
      return matchClass && matchStream;
    });
  }, [students, selectedClass, selectedStream]);

  // Read existing marks into state helper
  const getExistingMark = (studentId: string): number | undefined => {
    if (draftMarks[studentId] !== undefined) {
      return draftMarks[studentId];
    }
    const record = marks.find(
      (m) =>
        m.studentId === studentId &&
        m.subjectCode === (currentSubject?.code || selectedSubjectCode) &&
        m.examType === selectedExamType &&
        m.term === currentSchool.currentTerm &&
        m.academicYear === currentSchool.currentAcademicYear
    );
    return record?.mark;
  };

  const handleMarkChange = (studentId: string, val: string) => {
    const num = val === '' ? 0 : parseInt(val, 10);
    if (!isNaN(num)) {
      const bounded = Math.min(100, Math.max(0, num));
      setDraftMarks((prev) => ({
        ...prev,
        [studentId]: bounded,
      }));
    }
  };

  // Save all entered marks
  const handleSaveAll = () => {
    const entries = eligibleStudents.map((student) => {
      const markValue = getExistingMark(student.id) ?? 0;
      return {
        studentId: student.id,
        subjectCode: currentSubject?.code || selectedSubjectCode,
        examType: selectedExamType,
        mark: markValue,
      };
    });

    batchSaveMarks(entries);
    setSaveSuccessMsg('Marks successfully saved to school academic database!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Quick helper to fill standard passing marks for demo testing
  const handlePrefillDemo = () => {
    const newDraft: Record<string, number> = {};
    eligibleStudents.forEach((student, idx) => {
      // realistic distributed grades (70-95 for high, 55-75 for mid)
      const base = 85 - (idx % 5) * 8 + Math.floor(Math.random() * 5);
      newDraft[student.id] = Math.min(98, Math.max(45, base));
    });
    setDraftMarks(newDraft);
  };

  // Calculate subject level summary stats
  const currentEnteredMarks = eligibleStudents
    .map((s) => getExistingMark(s.id))
    .filter((m): m is number => m !== undefined);

  const averageMark =
    currentEnteredMarks.length > 0
      ? Math.round(currentEnteredMarks.reduce((a, b) => a + b, 0) / currentEnteredMarks.length)
      : 0;

  const highestMark = currentEnteredMarks.length > 0 ? Math.max(...currentEnteredMarks) : 0;
  const lowestMark = currentEnteredMarks.length > 0 ? Math.min(...currentEnteredMarks) : 0;

  // Broadsheet reports
  const broadsheetReports = useMemo(() => {
    return getClassTermReports(selectedClass, selectedStream);
  }, [getClassTermReports, selectedClass, selectedStream]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
            Academic Operations · UNEB Grading Standards
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Marks & Examination Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentSchool.name} · Academic Year {currentSchool.currentAcademicYear} · Term {currentSchool.currentTerm}
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('subject_entry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'subject_entry'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Subject Entry
          </button>
          <button
            onClick={() => setViewMode('broadsheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'broadsheet'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Class Broadsheet (Master Grid)
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Class Select */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Class Level</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStream('All');
                setDraftMarks({});
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-800"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.level.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Stream Select */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Stream / Section</label>
            <select
              value={selectedStream}
              onChange={(e) => {
                setSelectedStream(e.target.value);
                setDraftMarks({});
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-800"
            >
              {streams.map((str) => (
                <option key={str} value={str}>
                  {str === 'All' ? 'All Streams' : `${str} Stream`}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type Select */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Exam Sitting</label>
            <select
              value={selectedExamType}
              onChange={(e) => {
                setSelectedExamType(e.target.value as ExamType);
                setDraftMarks({});
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-800"
            >
              <option value="BOT">Beginning of Term (BOT)</option>
              <option value="MID">Mid-Term Assessment (MID)</option>
              <option value="EOT">End of Term Exam (EOT)</option>
              <option value="MOCK">Mock Examination (MOCK)</option>
            </select>
          </div>

          {/* Subject Select (for Subject Entry view) */}
          {viewMode === 'subject_entry' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={selectedSubjectCode}
                onChange={(e) => {
                  setSelectedSubjectCode(e.target.value);
                  setDraftMarks({});
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-800"
              >
                {availableSubjects.map((sub) => (
                  <option key={sub.id} value={sub.code}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {saveSuccessMsg}
        </div>
      )}

      {/* VIEW 1: SUBJECT ENTRY SPREADSHEET */}
      {viewMode === 'subject_entry' && (
        <div className="space-y-4">
          {/* Subject Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500">Candidates Enrolled</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5 tabular-nums">
                {eligibleStudents.length}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500">Class Average</span>
              <div className="text-lg font-bold text-blue-900 mt-0.5 tabular-nums font-mono">
                {averageMark}%
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500">Highest Mark</span>
              <div className="text-lg font-bold text-emerald-700 mt-0.5 tabular-nums font-mono">
                {highestMark}%
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500">Lowest Mark</span>
              <div className="text-lg font-bold text-rose-700 mt-0.5 tabular-nums font-mono">
                {lowestMark}%
              </div>
            </div>
          </div>

          {/* Mark entry table card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {currentSubject ? `${currentSubject.code} · ${currentSubject.name}` : selectedSubjectCode} ({selectedExamType})
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  Max Marks: 100
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrefillDemo}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Auto-Fill Demo Marks
                </button>
                <button
                  onClick={handleSaveAll}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save All Marks
                </button>
              </div>
            </div>

            {eligibleStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No active students found in {selectedClass} {selectedStream !== 'All' ? `(${selectedStream})` : ''}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">#</th>
                      <th className="py-2.5 px-4">Admission No</th>
                      <th className="py-2.5 px-4">Pupil / Student Name</th>
                      <th className="py-2.5 px-4">Stream</th>
                      <th className="py-2.5 px-4 w-32">Mark (0–100)</th>
                      <th className="py-2.5 px-4">UNEB Grade</th>
                      <th className="py-2.5 px-4">Points</th>
                      <th className="py-2.5 px-4">Qualitative Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eligibleStudents.map((student, index) => {
                      const markVal = getExistingMark(student.id) ?? '';
                      const numVal = typeof markVal === 'number' ? markVal : 0;
                      const gradeInfo = getGradeForLevel(
                        numVal,
                        currentLevel,
                        currentSubject?.isSubsidiary
                      );

                      return (
                        <tr key={student.id} className="hover:bg-blue-50/40">
                          <td className="py-2.5 px-4 text-center text-slate-400 font-mono">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-600">
                            {student.admissionNumber}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">
                            {student.fullName}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            {student.stream}
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={markVal}
                              onChange={(e) => handleMarkChange(student.id, e.target.value)}
                              placeholder="0"
                              className="w-24 px-2 py-1 bg-white border border-slate-300 rounded-md font-mono font-bold text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-800 tabular-nums"
                            />
                          </td>
                          <td className="py-2.5 px-4 font-bold text-blue-900">
                            {gradeInfo.grade}
                          </td>
                          <td className="py-2.5 px-4 font-mono font-semibold text-slate-700 tabular-nums">
                            {gradeInfo.points}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            {gradeInfo.remarks}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: BROADSHEET MASTER GRID */}
      {viewMode === 'broadsheet' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">
                Official Academic Broadsheet · {selectedClass} {selectedStream !== 'All' ? `(${selectedStream})` : ''}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Composite End of Term ranking, aggregate calculation, and UNEB Division placement
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Print / Export Broadsheet
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Stream</th>
                  {availableSubjects.map((sub) => (
                    <th key={sub.code} className="py-2.5 px-2 text-center">
                      <div>{sub.code}</div>
                      <div className="text-[9px] font-normal text-slate-500">M / Grd</div>
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right">Total Marks</th>
                  <th className="py-2.5 px-3 text-right">Aggregate</th>
                  <th className="py-2.5 px-3 text-center">Division</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {broadsheetReports.map((report) => (
                  <tr key={report.student.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-bold text-slate-800 tabular-nums">
                      #{report.classRank}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {report.student.fullName}
                      <div className="text-[10px] text-slate-400 font-mono font-normal">
                        {report.student.admissionNumber}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {report.student.stream}
                    </td>

                    {/* Subject scores */}
                    {availableSubjects.map((sub) => {
                      const res = report.subjectResults.find((r) => r.subjectCode === sub.code);
                      return (
                        <td key={sub.code} className="py-2 px-2 text-center font-mono tabular-nums">
                          {res ? (
                            <div>
                              <span className="font-semibold text-slate-800">{res.finalMark}</span>
                              <span className="text-[10px] text-blue-900 ml-1 font-bold">
                                {res.grade}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 tabular-nums">
                      {report.totalMarks}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-blue-950 tabular-nums">
                      {report.aggregate}
                    </td>
                    <td className="py-2 px-3 text-center font-semibold">
                      <span className="text-blue-900 font-bold">
                        {report.division}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
