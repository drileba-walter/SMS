/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchoolLevelType, StudentSubjectResult } from '../types';

export interface GradeInfo {
  grade: string;
  points: number;
  remarks: string;
}

/**
 * Calculates UNEB Primary (PLE) grade from marks (0-100)
 */
export function calculatePrimaryGrade(mark: number): GradeInfo {
  if (mark >= 80) return { grade: 'D1', points: 1, remarks: 'Distinction 1' };
  if (mark >= 75) return { grade: 'D2', points: 2, remarks: 'Distinction 2' };
  if (mark >= 70) return { grade: 'C3', points: 3, remarks: 'Credit 3' };
  if (mark >= 65) return { grade: 'C4', points: 4, remarks: 'Credit 4' };
  if (mark >= 60) return { grade: 'C5', points: 5, remarks: 'Credit 5' };
  if (mark >= 55) return { grade: 'C6', points: 6, remarks: 'Credit 6' };
  if (mark >= 45) return { grade: 'P7', points: 7, remarks: 'Pass 7' };
  if (mark >= 40) return { grade: 'P8', points: 8, remarks: 'Pass 8' };
  return { grade: 'F9', points: 9, remarks: 'Fail 9' };
}

/**
 * Calculates UNEB O-Level (UCE) grade from marks (0-100)
 */
export function calculateOLevelGrade(mark: number): GradeInfo {
  if (mark >= 80) return { grade: 'D1 (A)', points: 1, remarks: 'Distinction' };
  if (mark >= 75) return { grade: 'D2 (A)', points: 2, remarks: 'Distinction' };
  if (mark >= 70) return { grade: 'C3 (B)', points: 3, remarks: 'Credit' };
  if (mark >= 65) return { grade: 'C4 (B)', points: 4, remarks: 'Credit' };
  if (mark >= 60) return { grade: 'C5 (C)', points: 5, remarks: 'Credit' };
  if (mark >= 55) return { grade: 'C6 (C)', points: 6, remarks: 'Credit' };
  if (mark >= 45) return { grade: 'P7 (D)', points: 7, remarks: 'Pass' };
  if (mark >= 40) return { grade: 'P8 (D)', points: 8, remarks: 'Pass' };
  return { grade: 'F9 (E)', points: 9, remarks: 'Fail' };
}

/**
 * Calculates UNEB A-Level (UACE) grade from marks (0-100)
 */
export function calculateALevelGrade(mark: number, isSubsidiary: boolean = false): GradeInfo {
  if (isSubsidiary) {
    if (mark >= 40) return { grade: '1 (Pass)', points: 1, remarks: 'Subsidiary Pass' };
    return { grade: '0 (Fail)', points: 0, remarks: 'Subsidiary Fail' };
  }

  if (mark >= 80) return { grade: 'A', points: 6, remarks: 'Principal Pass (A)' };
  if (mark >= 70) return { grade: 'B', points: 5, remarks: 'Principal Pass (B)' };
  if (mark >= 60) return { grade: 'C', points: 4, remarks: 'Principal Pass (C)' };
  if (mark >= 50) return { grade: 'D', points: 3, remarks: 'Principal Pass (D)' };
  if (mark >= 40) return { grade: 'E', points: 2, remarks: 'Principal Pass (E)' };
  if (mark >= 35) return { grade: 'O', points: 1, remarks: 'Subsidiary Level Pass' };
  return { grade: 'F', points: 0, remarks: 'Fail' };
}

/**
 * Calculates Nursery qualitative assessment
 */
export function calculateNurseryGrade(mark: number): GradeInfo {
  if (mark >= 85) return { grade: 'Excellent', points: 1, remarks: 'Exceptional concept mastery' };
  if (mark >= 70) return { grade: 'Very Good', points: 2, remarks: 'Very good grasp of learning area' };
  if (mark >= 55) return { grade: 'Good', points: 3, remarks: 'Good progress and participation' };
  if (mark >= 40) return { grade: 'Fair', points: 4, remarks: 'Fair effort, needs more guidance' };
  return { grade: 'Needs Improvement', points: 5, remarks: 'Requires special attention' };
}

/**
 * Generic grade evaluator dispatching to the appropriate level logic
 */
export function getGradeForLevel(mark: number, level: SchoolLevelType, isSubsidiary: boolean = false): GradeInfo {
  switch (level) {
    case 'nursery':
      return calculateNurseryGrade(mark);
    case 'primary':
      return calculatePrimaryGrade(mark);
    case 'o_level':
      return calculateOLevelGrade(mark);
    case 'a_level':
      return calculateALevelGrade(mark, isSubsidiary);
    default:
      return calculatePrimaryGrade(mark);
  }
}

/**
 * Computes Primary PLE Aggregate (Best 4 subjects, usually the 4 core: ENG, MTC, SCI, SST)
 * Aggregate = sum of points (lower is better: 4 is best, 36 is worst)
 */
export function computePrimaryPLEAggregate(results: StudentSubjectResult[]): {
  aggregate: number;
  division: string;
} {
  if (results.length === 0) {
    return { aggregate: 0, division: 'N/A' };
  }

  // Find core subjects first or take best 4
  const coreCodes = ['ENG', 'MTC', 'SCI', 'SST'];
  const coreResults = results.filter((r) => coreCodes.includes(r.subjectCode.toUpperCase()));

  let selected: StudentSubjectResult[] = [];
  if (coreResults.length === 4) {
    selected = coreResults;
  } else {
    // Sort ascending by points (since in PLE, 1 is best, 9 is fail)
    selected = [...results].sort((a, b) => a.points - b.points).slice(0, 4);
  }

  const aggregate = selected.reduce((sum, item) => sum + item.points, 0);

  // Determine Division
  // Div 1: 4 - 12 (no F9 in core)
  // Div 2: 13 - 24
  // Div 3: 25 - 29
  // Div 4: 30 - 33
  // Div U: 34 - 36
  const hasF9 = selected.some((r) => r.grade === 'F9');
  let division = 'Division U';

  if (aggregate >= 4 && aggregate <= 12 && !hasF9) {
    division = 'Division 1';
  } else if (aggregate <= 24) {
    division = 'Division 2';
  } else if (aggregate <= 29) {
    division = 'Division 3';
  } else if (aggregate <= 33) {
    division = 'Division 4';
  } else {
    division = 'Division U';
  }

  return { aggregate, division };
}

/**
 * Computes O-Level UCE Aggregate (Best 8 subjects)
 */
export function computeOLevelUCEAggregate(results: StudentSubjectResult[]): {
  aggregate: number;
  division: string;
} {
  if (results.length === 0) {
    return { aggregate: 0, division: 'N/A' };
  }

  // Sort ascending by points (1 is best, 9 is fail)
  const sorted = [...results].sort((a, b) => a.points - b.points);
  const best8 = sorted.slice(0, 8);
  const aggregate = best8.reduce((sum, item) => sum + item.points, 0);

  let division = 'Division 4';
  if (aggregate <= 32) division = 'Division 1';
  else if (aggregate <= 45) division = 'Division 2';
  else if (aggregate <= 58) division = 'Division 3';
  else if (aggregate <= 72) division = 'Division 4';
  else division = 'Division 9 / U';

  return { aggregate, division };
}

/**
 * Computes A-Level UACE Total Points (Principals A=6..F=0 + Subsidiaries 1/0, Max 20)
 */
export function computeALevelUACEPoints(results: StudentSubjectResult[]): {
  aggregate: number;
  division: string;
} {
  if (results.length === 0) {
    return { aggregate: 0, division: 'N/A' };
  }

  const totalPoints = results.reduce((sum, item) => sum + item.points, 0);

  let division = `${totalPoints} Points`;
  if (totalPoints >= 18) {
    division = `${totalPoints} Points (Distinction - Direct University Entry)`;
  } else if (totalPoints >= 12) {
    division = `${totalPoints} Points (Principal Passes)`;
  } else if (totalPoints >= 6) {
    division = `${totalPoints} Points (Pass)`;
  } else {
    division = `${totalPoints} Points (Below Diploma Cut-off)`;
  }

  return { aggregate: totalPoints, division };
}

/**
 * Format currency in Ugandan Shillings (UGX)
 */
export function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString('en-US')}`;
}

/**
 * Generate standard Ugandan Head Teacher report card remark
 */
export function getHeadTeacherRemarks(division: string, level: SchoolLevelType): string {
  if (level === 'nursery') {
    return 'Good social and learning adaptation. Ready for further developmental exploration next term.';
  }

  if (division.includes('Division 1') || division.includes('Distinction') || division.includes('18 Points')) {
    return 'An exemplary academic achievement. Keep up this disciplined dedication and standard of excellence.';
  }
  if (division.includes('Division 2') || division.includes('12 Points')) {
    return 'Good overall performance. With more targeted focus in weaker areas, Division One is well within reach.';
  }
  if (division.includes('Division 3')) {
    return 'Fair performance, but there is significant room for improvement. Must put in extra remedial effort.';
  }
  return 'Below standard. Parent / guardian is requested to come for a mandatory academic conference.';
}

/**
 * Generate standard Ugandan Class Teacher report card remark
 */
export function getClassTeacherRemarks(division: string): string {
  if (division.includes('Division 1')) {
    return 'Diligent, attentive, and consistently active in all classroom activities. Commendable effort.';
  }
  if (division.includes('Division 2')) {
    return 'A steady worker with good potential. Needs to be more consistent in daily revision and homework.';
  }
  if (division.includes('Division 3')) {
    return 'Capable of much better results. Needs to avoid peer distractions and seek teacher guidance.';
  }
  return 'Lacks focus and regular attendance. Must redouble efforts and attend evening prep diligently.';
}
