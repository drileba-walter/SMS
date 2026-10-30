/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { BookOpen, Plus, BookUp, BookDown, Search, AlertTriangle, CheckCircle, X } from 'lucide-react';

export const LibraryView: React.FC = () => {
  const { currentSchool, books, bookIssues, students, staff, addBook, issueBook, returnBook } =
    useSchool();

  const [activeTab, setActiveTab] = useState<'catalog' | 'loans'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Add Book state
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbnOrCallNo: '',
    category: 'Textbook' as const,
    totalCopies: 30,
    availableCopies: 30,
  });

  // Issue Book state
  const [issueBookId, setIssueBookId] = useState(books[0]?.id || '');
  const [borrowerType, setBorrowerType] = useState<'Student' | 'Staff'>('Student');
  const [borrowerId, setBorrowerId] = useState(students[0]?.id || '');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 14 days standard loan
    return d.toISOString().split('T')[0];
  });

  // Filtered books
  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.isbnOrCallNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title) return;
    addBook({
      ...newBook,
      targetLevel: currentSchool.levels[0] || 'primary',
      availableCopies: newBook.totalCopies,
    });
    setShowAddBookModal(false);
  };

  const handleConfirmIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const borrowerName =
      borrowerType === 'Student'
        ? students.find((s) => s.id === borrowerId)?.fullName || 'Student'
        : staff.find((st) => st.id === borrowerId)?.fullName || 'Staff Member';

    issueBook(issueBookId, borrowerType, borrowerId, borrowerName, dueDate);
    setShowIssueModal(false);
  };

  const overdueCount = bookIssues.filter((i) => i.status === 'Overdue').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
            Curriculum Textbooks & Resource Center
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            School Library & Book Circulation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage course textbooks, past papers, issue loans, and track returns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIssueModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <BookUp className="w-3.5 h-3.5 text-blue-800" />
            Issue Book Loan
          </button>
          <button
            onClick={() => setShowAddBookModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Catalog New Title
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'catalog'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Book Inventory ({books.length} Titles)
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'loans'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Circulation & Loans ({bookIssues.length})
          {overdueCount > 0 && (
            <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              {overdueCount} Overdue
            </span>
          )}
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, author, call number..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Call No / ISBN</th>
                    <th className="py-2.5 px-3">Book Title</th>
                    <th className="py-2.5 px-3">Author / Publisher</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Total Copies</th>
                    <th className="py-2.5 px-3 text-center">Available</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                        {book.isbnOrCallNo}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{book.title}</td>
                      <td className="py-2.5 px-3 text-slate-600">{book.author}</td>
                      <td className="py-2.5 px-3 text-slate-700">{book.category}</td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-600">
                        {book.totalCopies}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold tabular-nums text-emerald-800">
                        {book.availableCopies}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setIssueBookId(book.id);
                            setShowIssueModal(true);
                          }}
                          disabled={book.availableCopies <= 0}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 rounded border border-blue-200"
                        >
                          Check Out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Loans Tab */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Book Title</th>
                  <th className="py-2.5 px-3">Borrower</th>
                  <th className="py-2.5 px-3">Borrower Type</th>
                  <th className="py-2.5 px-3 font-mono">Issued Date</th>
                  <th className="py-2.5 px-3 font-mono">Due Date</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookIssues.map((issue) => {
                  const book = books.find((b) => b.id === issue.bookId);
                  return (
                    <tr key={issue.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {book?.title || 'Book Title'}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {issue.borrowerName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{issue.borrowerType}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{issue.issueDate}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{issue.dueDate}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-semibold text-[11px] ${
                            issue.status === 'Returned'
                              ? 'text-emerald-700'
                              : issue.status === 'Overdue'
                              ? 'text-rose-700 font-bold'
                              : 'text-amber-700'
                          }`}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {issue.status !== 'Returned' && (
                          <button
                            onClick={() => returnBook(issue.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                          >
                            Mark Returned
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ISSUE BOOK MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 text-xs">
            <h2 className="font-bold text-slate-900 text-sm mb-3">
              Issue Book from Library
            </h2>
            <form onSubmit={handleConfirmIssue} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Book Title *</label>
                <select
                  value={issueBookId}
                  onChange={(e) => setIssueBookId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.availableCopies} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Borrower Type</label>
                <select
                  value={borrowerType}
                  onChange={(e) => setBorrowerType(e.target.value as 'Student' | 'Staff')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5"
                >
                  <option value="Student">Pupil / Student</option>
                  <option value="Staff">Teacher / Staff</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Borrower *
                </label>
                <select
                  value={borrowerId}
                  onChange={(e) => setBorrowerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5"
                >
                  {borrowerType === 'Student'
                    ? students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.className} {s.stream})
                        </option>
                      ))
                    : staff.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.fullName} ({st.role})
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-3 py-1.5 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATALOG NEW TITLE MODAL */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 text-xs">
            <h2 className="font-bold text-slate-900 text-sm mb-3">
              Add Book to Catalog
            </h2>
            <form onSubmit={handleCreateBook} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="e.g. MK Primary Mathematics Book 7"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Author / Publisher</label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  placeholder="e.g. Fountain Publishers Ltd"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Call Number / ISBN</label>
                  <input
                    type="text"
                    value={newBook.isbnOrCallNo}
                    onChange={(e) => setNewBook({ ...newBook, isbnOrCallNo: e.target.value })}
                    placeholder="e.g. MK-MTC-07"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Number of Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={newBook.totalCopies}
                    onChange={(e) =>
                      setNewBook({ ...newBook, totalCopies: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-3 py-1.5 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Title
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
