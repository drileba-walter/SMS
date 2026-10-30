/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  School,
  SchoolLevelType,
  SchoolClass,
  Subject,
  Student,
  Staff,
  MarkEntry,
  FeeStructure,
  FeePayment,
  DailyAttendance,
  StaffAttendanceRecord,
  TimetableSlot,
  LibraryBook,
  BookIssue,
  Announcement,
  User,
  UserRole,
  StudentTermReport,
  StudentSubjectResult,
  StudentFeeSummary,
} from '../types';
import {
  INITIAL_SCHOOLS,
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_STAFF,
  INITIAL_MARKS,
  INITIAL_FEE_STRUCTURES,
  INITIAL_PAYMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_TIMETABLE,
  INITIAL_BOOKS,
  INITIAL_BOOK_ISSUES,
  INITIAL_ANNOUNCEMENTS,
} from '../data/initialData';
import {
  getGradeForLevel,
  computePrimaryPLEAggregate,
  computeOLevelUCEAggregate,
  computeALevelUACEPoints,
  getClassTeacherRemarks,
  getHeadTeacherRemarks,
} from '../utils/unebGrading';

interface SchoolContextType {
  // Current session & Multi-tenancy
  currentSchool: School;
  schools: School[];
  setCurrentSchoolId: (id: string) => void;
  currentUser: User;
  users: User[];
  setCurrentUserRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;

  // Domain data scoped to current school
  classes: SchoolClass[];
  subjects: Subject[];
  students: Student[];
  staff: Staff[];
  marks: MarkEntry[];
  feeStructures: FeeStructure[];
  payments: FeePayment[];
  attendance: DailyAttendance[];
  staffAttendance: StaffAttendanceRecord[];
  timetable: TimetableSlot[];
  books: LibraryBook[];
  bookIssues: BookIssue[];
  announcements: Announcement[];

  // Mutators
  addStudent: (student: Omit<Student, 'id' | 'schoolId'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  bulkAddStudents: (students: Omit<Student, 'id' | 'schoolId'>[]) => void;
  promoteStudents: (studentIds: string[], targetClass: string) => void;

  addStaff: (staffMember: Omit<Staff, 'id' | 'schoolId'>) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  markStaffAttendance: (staffId: string, status: 'Present' | 'Absent' | 'On Leave') => void;

  recordMark: (studentId: string, subjectCode: string, examType: 'BOT' | 'MID' | 'EOT' | 'MOCK', mark: number) => void;
  batchSaveMarks: (entries: { studentId: string; subjectCode: string; examType: 'BOT' | 'MID' | 'EOT' | 'MOCK'; mark: number }[]) => void;

  addPayment: (payment: Omit<FeePayment, 'id' | 'schoolId' | 'receiptNumber'>) => string;
  updateFeeStructure: (structure: FeeStructure) => void;

  saveDailyAttendance: (className: string, stream: string, date: string, records: { studentId: string; status: 'Present' | 'Absent' | 'Late' | 'Excused'; reason?: string }[]) => void;

  addTimetableSlot: (slot: Omit<TimetableSlot, 'id' | 'schoolId'>) => void;
  deleteTimetableSlot: (id: string) => void;

  addBook: (book: Omit<LibraryBook, 'id' | 'schoolId'>) => void;
  issueBook: (bookId: string, borrowerType: 'Student' | 'Staff', borrowerId: string, borrowerName: string, dueDate: string) => void;
  returnBook: (issueId: string) => void;

  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'schoolId' | 'postedDate'>) => void;
  deleteAnnouncement: (id: string) => void;

  updateSchoolProfile: (updates: Partial<School>) => void;
  addNewSchool: (school: Omit<School, 'id' | 'createdAt'>) => string;

  // Calculators & Helpers
  getStudentTermReport: (studentId: string, term?: 1 | 2 | 3, year?: string) => StudentTermReport | null;
  getClassTermReports: (className: string, stream?: string, term?: 1 | 2 | 3, year?: string) => StudentTermReport[];
  getStudentFeeSummary: (studentId: string) => StudentFeeSummary;

  // System management
  resetToDefaultData: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonStr: string) => boolean;
}

const STORAGE_KEY = 'corelink_school_state_v2';

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state or defaults
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_schools`);
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  });

  const [currentSchoolId, setCurrentSchoolId] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_currentSchoolId`) || 'school-kqa';
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_currentUserId`) || 'user-admin';
  });

  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_subjects`);
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_staff`);
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [marks, setMarks] = useState<MarkEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_marks`);
    return saved ? JSON.parse(saved) : INITIAL_MARKS;
  });

  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_feeStructures`);
    return saved ? JSON.parse(saved) : INITIAL_FEE_STRUCTURES;
  });

  const [payments, setPayments] = useState<FeePayment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [attendance, setAttendance] = useState<DailyAttendance[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord[]>([]);

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_timetable`);
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
  });

  const [books, setBooks] = useState<LibraryBook[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_books`);
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [bookIssues, setBookIssues] = useState<BookIssue[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_bookIssues`);
    return saved ? JSON.parse(saved) : INITIAL_BOOK_ISSUES;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_announcements`);
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_schools`, JSON.stringify(schools));
      localStorage.setItem(`${STORAGE_KEY}_currentSchoolId`, currentSchoolId);
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_KEY}_currentUserId`, currentUserId);
      localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
      localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
      localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
      localStorage.setItem(`${STORAGE_KEY}_staff`, JSON.stringify(staff));
      localStorage.setItem(`${STORAGE_KEY}_marks`, JSON.stringify(marks));
      localStorage.setItem(`${STORAGE_KEY}_feeStructures`, JSON.stringify(feeStructures));
      localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
      localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendance));
      localStorage.setItem(`${STORAGE_KEY}_timetable`, JSON.stringify(timetable));
      localStorage.setItem(`${STORAGE_KEY}_books`, JSON.stringify(books));
      localStorage.setItem(`${STORAGE_KEY}_bookIssues`, JSON.stringify(bookIssues));
      localStorage.setItem(`${STORAGE_KEY}_announcements`, JSON.stringify(announcements));
    } catch {
      // quota or local storage restriction
    }
  }, [schools, currentSchoolId, users, currentUserId, classes, subjects, students, staff, marks, feeStructures, payments, attendance, timetable, books, bookIssues, announcements]);

  // Current active school
  const currentSchool = useMemo(() => {
    return schools.find((s) => s.id === currentSchoolId) || schools[0];
  }, [schools, currentSchoolId]);

  // Current active user
  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  // Filter school-scoped records
  const schoolStudents = useMemo(() => students.filter((s) => s.schoolId === currentSchool.id), [students, currentSchool.id]);
  const schoolStaff = useMemo(() => staff.filter((s) => s.schoolId === currentSchool.id), [staff, currentSchool.id]);
  const schoolMarks = useMemo(() => marks.filter((m) => m.schoolId === currentSchool.id), [marks, currentSchool.id]);
  const schoolFeeStructures = useMemo(() => feeStructures.filter((f) => f.schoolId === currentSchool.id), [feeStructures, currentSchool.id]);
  const schoolPayments = useMemo(() => payments.filter((p) => p.schoolId === currentSchool.id), [payments, currentSchool.id]);
  const schoolAttendance = useMemo(() => attendance.filter((a) => a.schoolId === currentSchool.id), [attendance, currentSchool.id]);
  const schoolStaffAttendance = useMemo(() => staffAttendance.filter((a) => a.schoolId === currentSchool.id), [staffAttendance, currentSchool.id]);
  const schoolTimetable = useMemo(() => timetable.filter((t) => t.schoolId === currentSchool.id), [timetable, currentSchool.id]);
  const schoolBooks = useMemo(() => books.filter((b) => b.schoolId === currentSchool.id), [books, currentSchool.id]);
  const schoolBookIssues = useMemo(() => bookIssues.filter((i) => i.schoolId === currentSchool.id), [bookIssues, currentSchool.id]);
  const schoolAnnouncements = useMemo(() => announcements.filter((a) => a.schoolId === currentSchool.id), [announcements, currentSchool.id]);

  // School applicable classes
  const schoolClasses = useMemo(() => {
    return classes.filter((c) => currentSchool.levels.includes(c.level));
  }, [classes, currentSchool.levels]);

  // School applicable subjects
  const schoolSubjects = useMemo(() => {
    return subjects.filter((s) => currentSchool.levels.includes(s.level));
  }, [subjects, currentSchool.levels]);

  // Role switch helper
  const setCurrentUserRole = (role: UserRole) => {
    // Find an existing user with this role or update current user
    const matchingUser = users.find((u) => u.role === role);
    if (matchingUser) {
      setCurrentUserId(matchingUser.id);
    } else {
      const updatedUser: User = {
        ...currentUser,
        role,
      };
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    }
  };

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  // Mutator actions
  const addStudent = (studentData: Omit<Student, 'id' | 'schoolId'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      schoolId: currentSchool.id,
    };
    setStudents((prev) => [newStudent, ...prev]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const bulkAddStudents = (studentsList: Omit<Student, 'id' | 'schoolId'>[]) => {
    const formatted: Student[] = studentsList.map((s, idx) => ({
      ...s,
      id: `std-${Date.now()}-${idx}`,
      schoolId: currentSchool.id,
    }));
    setStudents((prev) => [...formatted, ...prev]);
  };

  const promoteStudents = (studentIds: string[], targetClass: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (studentIds.includes(s.id)) {
          return {
            ...s,
            className: targetClass,
            status: targetClass === 'Alumni' ? 'Alumni' : 'Active',
          };
        }
        return s;
      })
    );
  };

  const addStaff = (staffData: Omit<Staff, 'id' | 'schoolId'>) => {
    const newStaff: Staff = {
      ...staffData,
      id: `stf-${Date.now()}`,
      schoolId: currentSchool.id,
    };
    setStaff((prev) => [newStaff, ...prev]);
  };

  const updateStaff = (id: string, updates: Partial<Staff>) => {
    setStaff((prev) => prev.map((st) => (st.id === id ? { ...st, ...updates } : st)));
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((st) => st.id !== id));
  };

  const markStaffAttendance = (staffId: string, status: 'Present' | 'Absent' | 'On Leave') => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStaffAttendance((prev) => {
      const existing = prev.find((a) => a.staffId === staffId && a.date === today && a.schoolId === currentSchool.id);
      if (existing) {
        return prev.map((a) =>
          a.id === existing.id
            ? { ...a, status, checkOutTime: status === 'Present' ? now : undefined }
            : a
        );
      } else {
        return [
          {
            id: `sa-${Date.now()}`,
            schoolId: currentSchool.id,
            staffId,
            date: today,
            status,
            checkInTime: status === 'Present' ? now : undefined,
          },
          ...prev,
        ];
      }
    });
  };

  const recordMark = (
    studentId: string,
    subjectCode: string,
    examType: 'BOT' | 'MID' | 'EOT' | 'MOCK',
    mark: number
  ) => {
    const validMark = Math.min(100, Math.max(0, mark));
    setMarks((prev) => {
      const idx = prev.findIndex(
        (m) =>
          m.schoolId === currentSchool.id &&
          m.studentId === studentId &&
          m.subjectCode === subjectCode &&
          m.examType === examType &&
          m.term === currentSchool.currentTerm &&
          m.academicYear === currentSchool.currentAcademicYear
      );

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], mark: validMark };
        return copy;
      } else {
        return [
          {
            id: `mk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            schoolId: currentSchool.id,
            studentId,
            subjectCode,
            examType,
            term: currentSchool.currentTerm,
            academicYear: currentSchool.currentAcademicYear,
            mark: validMark,
          },
          ...prev,
        ];
      }
    });
  };

  const batchSaveMarks = (
    entries: { studentId: string; subjectCode: string; examType: 'BOT' | 'MID' | 'EOT' | 'MOCK'; mark: number }[]
  ) => {
    setMarks((prev) => {
      let current = [...prev];
      for (const entry of entries) {
        const validMark = Math.min(100, Math.max(0, entry.mark));
        const idx = current.findIndex(
          (m) =>
            m.schoolId === currentSchool.id &&
            m.studentId === entry.studentId &&
            m.subjectCode === entry.subjectCode &&
            m.examType === entry.examType &&
            m.term === currentSchool.currentTerm &&
            m.academicYear === currentSchool.currentAcademicYear
        );

        if (idx >= 0) {
          current[idx] = { ...current[idx], mark: validMark };
        } else {
          current.push({
            id: `mk-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            schoolId: currentSchool.id,
            studentId: entry.studentId,
            subjectCode: entry.subjectCode,
            examType: entry.examType,
            term: currentSchool.currentTerm,
            academicYear: currentSchool.currentAcademicYear,
            mark: validMark,
          });
        }
      }
      return current;
    });
  };

  const addPayment = (paymentData: Omit<FeePayment, 'id' | 'schoolId' | 'receiptNumber'>) => {
    const receiptNumber = `REC-${currentSchool.currentAcademicYear}-${String(payments.length + 420).padStart(5, '0')}`;
    const newPayment: FeePayment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      schoolId: currentSchool.id,
      receiptNumber,
    };
    setPayments((prev) => [newPayment, ...prev]);
    return receiptNumber;
  };

  const updateFeeStructure = (structure: FeeStructure) => {
    setFeeStructures((prev) => {
      const idx = prev.findIndex((f) => f.id === structure.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = structure;
        return copy;
      }
      return [structure, ...prev];
    });
  };

  const saveDailyAttendance = (
    className: string,
    stream: string,
    date: string,
    records: { studentId: string; status: 'Present' | 'Absent' | 'Late' | 'Excused'; reason?: string }[]
  ) => {
    setAttendance((prev) => {
      const filtered = prev.filter(
        (a) =>
          !(a.schoolId === currentSchool.id && a.className === className && a.stream === stream && a.date === date)
      );
      const newAttendance: DailyAttendance = {
        id: `att-${Date.now()}`,
        schoolId: currentSchool.id,
        className,
        stream,
        date,
        records,
      };
      return [newAttendance, ...filtered];
    });
  };

  const addTimetableSlot = (slotData: Omit<TimetableSlot, 'id' | 'schoolId'>) => {
    const newSlot: TimetableSlot = {
      ...slotData,
      id: `tt-${Date.now()}`,
      schoolId: currentSchool.id,
    };
    setTimetable((prev) => [...prev, newSlot]);
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetable((prev) => prev.filter((t) => t.id !== id));
  };

  const addBook = (bookData: Omit<LibraryBook, 'id' | 'schoolId'>) => {
    const newBook: LibraryBook = {
      ...bookData,
      id: `bk-${Date.now()}`,
      schoolId: currentSchool.id,
    };
    setBooks((prev) => [newBook, ...prev]);
  };

  const issueBook = (
    bookId: string,
    borrowerType: 'Student' | 'Staff',
    borrowerId: string,
    borrowerName: string,
    dueDate: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newIssue: BookIssue = {
      id: `iss-${Date.now()}`,
      schoolId: currentSchool.id,
      bookId,
      borrowerType,
      borrowerId,
      borrowerName,
      issueDate: today,
      dueDate,
      status: 'Issued',
    };
    setBookIssues((prev) => [newIssue, ...prev]);

    // decrement available copies
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b))
    );
  };

  const returnBook = (issueId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const issue = bookIssues.find((i) => i.id === issueId);
    if (!issue) return;

    setBookIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: 'Returned', returnedDate: today } : i))
    );

    // increment available copies
    setBooks((prev) =>
      prev.map((b) => (b.id === issue.bookId ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b))
    );
  };

  const addAnnouncement = (announcementData: Omit<Announcement, 'id' | 'schoolId' | 'postedDate'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: `ann-${Date.now()}`,
      schoolId: currentSchool.id,
      postedDate: today,
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const updateSchoolProfile = (updates: Partial<School>) => {
    setSchools((prev) => prev.map((s) => (s.id === currentSchool.id ? { ...s, ...updates } : s)));
  };

  const addNewSchool = (schoolData: Omit<School, 'id' | 'createdAt'>) => {
    const newId = `school-${Date.now()}`;
    const newSchool: School = {
      ...schoolData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSchools((prev) => [...prev, newSchool]);
    setCurrentSchoolId(newId);
    return newId;
  };

  // Student Report Card & UNEB calculation
  const getStudentTermReport = (
    studentId: string,
    term: 1 | 2 | 3 = currentSchool.currentTerm,
    year: string = currentSchool.currentAcademicYear
  ): StudentTermReport | null => {
    const student = schoolStudents.find((s) => s.id === studentId);
    if (!student) return null;

    // Student's school class level
    const classObj = schoolClasses.find((c) => c.name === student.className);
    const level: SchoolLevelType = classObj?.level || (currentSchool.levels[0] || 'primary');

    // Get subjects for this level
    const relevantSubjects = schoolSubjects.filter((s) => s.level === level);

    // Get marks for this student
    const studentMarks = schoolMarks.filter(
      (m) => m.studentId === studentId && m.term === term && m.academicYear === year
    );

    const subjectResults: StudentSubjectResult[] = relevantSubjects.map((sub) => {
      const bot = studentMarks.find((m) => m.subjectCode === sub.code && m.examType === 'BOT')?.mark;
      const mid = studentMarks.find((m) => m.subjectCode === sub.code && m.examType === 'MID')?.mark;
      const eot = studentMarks.find((m) => m.subjectCode === sub.code && m.examType === 'EOT')?.mark;

      // Final mark weighting or latest available mark (EOT is 100% or weighted: BOT 20%, MID 30%, EOT 50%)
      let finalMark = 0;
      if (eot !== undefined && mid !== undefined && bot !== undefined) {
        finalMark = Math.round(bot * 0.2 + mid * 0.3 + eot * 0.5);
      } else if (eot !== undefined) {
        finalMark = eot;
      } else if (mid !== undefined) {
        finalMark = mid;
      } else if (bot !== undefined) {
        finalMark = bot;
      }

      const gradeInfo = getGradeForLevel(finalMark, level, sub.isSubsidiary);

      return {
        subjectCode: sub.code,
        subjectName: sub.name,
        botMark: bot,
        midMark: mid,
        eotMark: eot,
        finalMark,
        grade: gradeInfo.grade,
        points: gradeInfo.points,
        remarks: gradeInfo.remarks,
        teacherInitials: sub.name.substring(0, 3).toUpperCase(),
      };
    });

    const totalMarks = subjectResults.reduce((acc, curr) => acc + curr.finalMark, 0);
    const averageMarks = subjectResults.length > 0 ? Math.round(totalMarks / subjectResults.length) : 0;

    // UNEB Aggregate & Division computation
    let aggregate = 0;
    let division = 'Division 2';

    if (level === 'nursery') {
      aggregate = 1;
      division = 'Good Developmental Progress';
    } else if (level === 'primary') {
      const ple = computePrimaryPLEAggregate(subjectResults);
      aggregate = ple.aggregate;
      division = ple.division;
    } else if (level === 'o_level') {
      const uce = computeOLevelUCEAggregate(subjectResults);
      aggregate = uce.aggregate;
      division = uce.division;
    } else if (level === 'a_level') {
      const uace = computeALevelUACEPoints(subjectResults);
      aggregate = uace.aggregate;
      division = uace.division;
    }

    // Attendance calculation for student
    const studentAttendanceDays = schoolAttendance.filter((a) =>
      a.records.some((r) => r.studentId === studentId && (r.status === 'Present' || r.status === 'Late'))
    ).length;
    const totalDaysRecorded = Math.max(studentAttendanceDays, 65); // Standard term in Uganda has ~65 school days

    return {
      student,
      term,
      academicYear: year,
      subjectResults,
      totalMarks,
      averageMarks,
      aggregate,
      division,
      classRank: 1, // Will be calculated in batch
      totalInClass: 1,
      streamRank: 1,
      totalInStream: 1,
      attendanceDaysPresent: studentAttendanceDays > 0 ? studentAttendanceDays : 62,
      attendanceDaysTotal: totalDaysRecorded,
      classTeacherRemarks: getClassTeacherRemarks(division),
      headTeacherRemarks: getHeadTeacherRemarks(division, level),
      promotedToNextClass: division.includes('Division 1') || division.includes('Division 2') || division.includes('Points'),
    };
  };

  // Get ranked term reports for a whole class / stream
  const getClassTermReports = (
    className: string,
    stream?: string,
    term: 1 | 2 | 3 = currentSchool.currentTerm,
    year: string = currentSchool.currentAcademicYear
  ): StudentTermReport[] => {
    let classStudents = schoolStudents.filter((s) => s.className === className && s.status === 'Active');
    if (stream && stream !== 'All') {
      classStudents = classStudents.filter((s) => s.stream === stream);
    }

    const reports: StudentTermReport[] = [];
    for (const student of classStudents) {
      const rep = getStudentTermReport(student.id, term, year);
      if (rep) reports.push(rep);
    }

    // Sort by academic performance
    // For primary & O-Level: lowest aggregate is best! (e.g. Agg 4 is top)
    // For A-Level: highest points is best (e.g. 20 points is top)
    const classObj = schoolClasses.find((c) => c.name === className);
    const isALevel = classObj?.level === 'a_level';

    reports.sort((a, b) => {
      if (isALevel) {
        return b.aggregate - a.aggregate;
      }
      if (a.aggregate !== b.aggregate) {
        return a.aggregate - b.aggregate;
      }
      return b.totalMarks - a.totalMarks;
    });

    // Assign class and stream ranks
    const total = reports.length;
    return reports.map((r, index) => ({
      ...r,
      classRank: index + 1,
      totalInClass: total,
      streamRank: index + 1,
      totalInStream: total,
    }));
  };

  // Fee summary per student
  const getStudentFeeSummary = (studentId: string): StudentFeeSummary => {
    const student = schoolStudents.find((s) => s.id === studentId) || {
      id: studentId,
      schoolId: currentSchool.id,
      admissionNumber: 'N/A',
      fullName: 'Unknown Student',
      gender: 'Male',
      dateOfBirth: '',
      className: 'P.7',
      stream: 'Blue',
      parentName: '',
      parentPhone: '',
      residenceType: 'Day',
      enrollmentDate: '',
      status: 'Active',
    };

    const feeStructure = schoolFeeStructures.find(
      (f) =>
        f.className === student.className &&
        f.term === currentSchool.currentTerm &&
        f.academicYear === currentSchool.currentAcademicYear
    ) || schoolFeeStructures[0];

    const totalBilled =
      student.residenceType === 'Boarding'
        ? feeStructure?.totalBoardingAmount || 1200000
        : feeStructure?.totalDayAmount || 850000;

    const studentPayments = schoolPayments.filter(
      (p) =>
        p.studentId === studentId &&
        p.term === currentSchool.currentTerm &&
        p.academicYear === currentSchool.currentAcademicYear
    );

    const totalPaid = studentPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    const balance = Math.max(0, totalBilled - totalPaid);

    let status: 'Fully Paid' | 'Partial' | 'Overdue' = 'Overdue';
    if (balance === 0) status = 'Fully Paid';
    else if (totalPaid > 0) status = 'Partial';

    return {
      student,
      totalBilled,
      totalPaid,
      balance,
      status,
    };
  };

  // Reset to default data
  const resetToDefaultData = () => {
    localStorage.clear();
    setSchools(INITIAL_SCHOOLS);
    setCurrentSchoolId('school-kqa');
    setUsers(INITIAL_USERS);
    setCurrentUserId('user-admin');
    setClasses(INITIAL_CLASSES);
    setSubjects(INITIAL_SUBJECTS);
    setStudents(INITIAL_STUDENTS);
    setStaff(INITIAL_STAFF);
    setMarks(INITIAL_MARKS);
    setFeeStructures(INITIAL_FEE_STRUCTURES);
    setPayments(INITIAL_PAYMENTS);
    setAttendance(INITIAL_ATTENDANCE);
    setTimetable(INITIAL_TIMETABLE);
    setBooks(INITIAL_BOOKS);
    setBookIssues(INITIAL_BOOK_ISSUES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
  };

  // Export JSON backup
  const exportDatabaseJson = () => {
    const payload = {
      schools,
      classes,
      subjects,
      students,
      staff,
      marks,
      feeStructures,
      payments,
      attendance,
      timetable,
      books,
      bookIssues,
      announcements,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  };

  // Import JSON backup
  const importDatabaseJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.schools) setSchools(data.schools);
      if (data.classes) setClasses(data.classes);
      if (data.subjects) setSubjects(data.subjects);
      if (data.students) setStudents(data.students);
      if (data.staff) setStaff(data.staff);
      if (data.marks) setMarks(data.marks);
      if (data.feeStructures) setFeeStructures(data.feeStructures);
      if (data.payments) setPayments(data.payments);
      if (data.attendance) setAttendance(data.attendance);
      if (data.timetable) setTimetable(data.timetable);
      if (data.books) setBooks(data.books);
      if (data.bookIssues) setBookIssues(data.bookIssues);
      if (data.announcements) setAnnouncements(data.announcements);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <SchoolContext.Provider
      value={{
        currentSchool,
        schools,
        setCurrentSchoolId,
        currentUser,
        users,
        setCurrentUserRole,
        switchUser,
        classes: schoolClasses,
        subjects: schoolSubjects,
        students: schoolStudents,
        staff: schoolStaff,
        marks: schoolMarks,
        feeStructures: schoolFeeStructures,
        payments: schoolPayments,
        attendance: schoolAttendance,
        staffAttendance: schoolStaffAttendance,
        timetable: schoolTimetable,
        books: schoolBooks,
        bookIssues: schoolBookIssues,
        announcements: schoolAnnouncements,
        addStudent,
        updateStudent,
        deleteStudent,
        bulkAddStudents,
        promoteStudents,
        addStaff,
        updateStaff,
        deleteStaff,
        markStaffAttendance,
        recordMark,
        batchSaveMarks,
        addPayment,
        updateFeeStructure,
        saveDailyAttendance,
        addTimetableSlot,
        deleteTimetableSlot,
        addBook,
        issueBook,
        returnBook,
        addAnnouncement,
        deleteAnnouncement,
        updateSchoolProfile,
        addNewSchool,
        getStudentTermReport,
        getClassTermReports,
        getStudentFeeSummary,
        resetToDefaultData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
