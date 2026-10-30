/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SchoolLevelType = 'nursery' | 'primary' | 'o_level' | 'a_level';

export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'head_teacher'
  | 'teacher'
  | 'bursar'
  | 'librarian'
  | 'parent'
  | 'student';

export interface User {
  id: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  schoolId: string;
  avatarUrl?: string;
  linkedStudentId?: string; // For parents/students
}

export interface School {
  id: string;
  name: string;
  emisNumber: string; // Ugandan Education Management Information System No.
  levels: SchoolLevelType[];
  termStructure: 2 | 3; // 2 or 3 terms
  currentAcademicYear: string; // e.g. "2026"
  currentTerm: 1 | 2 | 3;
  motto: string;
  badgeColor: string; // Tailwind color or hex
  address: string;
  district: string;
  phone: string;
  email: string;
  headTeacherName: string;
  headTeacherSignatureTitle?: string;
  nextTermBeginsDate: string;
  createdAt: string;
}

export interface ClassStream {
  id: string;
  name: string; // e.g. "Blue", "Red", "East", "Cranes"
  classId: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "P.1", "P.7", "Baby Class", "S.4", "S.6"
  level: SchoolLevelType;
  order: number;
  streams: string[]; // e.g. ["Blue", "Red"]
}

export interface Subject {
  id: string;
  code: string; // e.g. "ENG", "MTC", "SCI", "SST", "PHY", "CHE"
  name: string;
  level: SchoolLevelType;
  isCore: boolean; // Compulsory in PLE or O-Level
  isSubsidiary?: boolean; // For A-Level (GP, Sub-Math, ICT)
  maxMarks: number;
}

export interface Student {
  id: string;
  schoolId: string;
  admissionNumber: string; // e.g. "KQA/2026/089"
  fullName: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  className: string; // e.g. "P.7", "S.4", "Top Class"
  stream: string; // e.g. "Blue"
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  residenceType: 'Day' | 'Boarding';
  photoUrl?: string;
  medicalNotes?: string;
  enrollmentDate: string;
  status: 'Active' | 'Alumni' | 'Transferred' | 'Suspended';
  aLevelCombination?: string; // e.g. "PCM/ICT", "HEG/GP"
}

export interface Staff {
  id: string;
  schoolId: string;
  fullName: string;
  role: 'Teacher' | 'Head Teacher' | 'Deputy Head Teacher' | 'Bursar' | 'Librarian' | 'Nurse' | 'Support Staff';
  phoneNumber: string;
  email: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
  subjectsTaught: string[]; // Subject IDs or codes
  classesAssigned: string[]; // e.g. ["P.7 Blue", "P.6 Red"]
  joiningDate: string;
  qualification: string;
}

export type ExamType = 'BOT' | 'MID' | 'EOT' | 'MOCK';

export interface MarkEntry {
  id: string;
  schoolId: string;
  studentId: string;
  subjectCode: string;
  academicYear: string;
  term: 1 | 2 | 3;
  examType: ExamType;
  mark: number; // 0 to 100
}

export interface StudentSubjectResult {
  subjectCode: string;
  subjectName: string;
  botMark?: number;
  midMark?: number;
  eotMark?: number;
  finalMark: number;
  grade: string; // D1, D2, C3, C4, C5, C6, P7, P8, F9 or A, B, C, D, E or Nursery qualitative
  points: number; // UNEB aggregate points (1 for D1 ... 9 for F9, or A-Level 6..0)
  remarks: string;
  teacherInitials: string;
}

export interface StudentTermReport {
  student: Student;
  term: 1 | 2 | 3;
  academicYear: string;
  subjectResults: StudentSubjectResult[];
  totalMarks: number;
  averageMarks: number;
  aggregate: number; // PLE best 4 (lowest best) or UCE best 8 or UACE total points
  division: string; // "Division 1", "Division 2", "Division 3", "Division 4", "Division U" or points
  classRank: number;
  totalInClass: number;
  streamRank: number;
  totalInStream: number;
  attendanceDaysPresent: number;
  attendanceDaysTotal: number;
  classTeacherRemarks: string;
  headTeacherRemarks: string;
  promotedToNextClass?: boolean;
}

export interface FeeItem {
  id: string;
  name: string; // e.g. "Tuition Fee", "Development Fund", "Boarding Fee", "Lunch", "Computer Lab"
  amount: number; // In UGX
  applicableTo: 'All' | 'Day' | 'Boarding';
}

export interface FeeStructure {
  id: string;
  schoolId: string;
  className: string;
  term: 1 | 2 | 3;
  academicYear: string;
  items: FeeItem[];
  totalDayAmount: number;
  totalBoardingAmount: number;
}

export type PaymentMethod = 'MTN Mobile Money' | 'Airtel Money' | 'Bank Deposit' | 'Cash';

export interface FeePayment {
  id: string;
  schoolId: string;
  receiptNumber: string; // e.g. "REC-2026-00421"
  studentId: string;
  amountPaid: number; // UGX
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string; // Bank slip no or MoMo Transaction ID
  term: 1 | 2 | 3;
  academicYear: string;
  receivedBy: string;
  notes?: string;
}

export interface StudentFeeSummary {
  student: Student;
  totalBilled: number;
  totalPaid: number;
  balance: number;
  status: 'Fully Paid' | 'Partial' | 'Overdue';
}

export interface DailyAttendance {
  id: string;
  schoolId: string;
  date: string; // YYYY-MM-DD
  className: string;
  stream: string;
  records: {
    studentId: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
    reason?: string;
  }[];
}

export interface StaffAttendanceRecord {
  id: string;
  schoolId: string;
  staffId: string;
  date: string;
  status: 'Present' | 'Absent' | 'On Leave';
  checkInTime?: string;
  checkOutTime?: string;
}

export interface TimetableSlot {
  id: string;
  schoolId: string;
  className: string;
  stream: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  periodNumber: number; // 1 to 8
  startTime: string;
  endTime: string;
  subjectCode: string;
  teacherName: string;
  isBreak?: boolean;
  breakTitle?: string;
}

export interface LibraryBook {
  id: string;
  schoolId: string;
  isbnOrCallNo: string;
  title: string;
  author: string;
  category: 'Textbook' | 'Revision' | 'Fiction' | 'Reference' | 'Past Papers';
  targetLevel: SchoolLevelType;
  totalCopies: number;
  availableCopies: number;
}

export interface BookIssue {
  id: string;
  schoolId: string;
  bookId: string;
  borrowerType: 'Student' | 'Staff';
  borrowerId: string;
  borrowerName: string;
  issueDate: string;
  dueDate: string;
  returnedDate?: string;
  status: 'Issued' | 'Returned' | 'Overdue';
}

export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  targetAudience: 'All' | 'Teachers' | 'Parents' | 'Students';
  priority: 'Normal' | 'Important' | 'Urgent';
  postedBy: string;
  postedDate: string;
}
