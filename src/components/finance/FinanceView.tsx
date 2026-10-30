/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FeePayment, PaymentMethod } from '../../types';
import { formatUGX } from '../../utils/unebGrading';
import {
  Wallet,
  Receipt,
  PlusCircle,
  Search,
  Printer,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
  DollarSign,
  X,
  CreditCard,
  Send,
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const {
    currentSchool,
    classes,
    students,
    feeStructures,
    payments,
    addPayment,
    getStudentFeeSummary,
  } = useSchool();

  // Active view tab inside finance
  const [activeFinanceTab, setActiveFinanceTab] = useState<'payments' | 'balances' | 'structure'>('balances');
  const [classFilter, setClassFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Payment Recording Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<string>(students[0]?.id || '');
  const [payAmount, setPayAmount] = useState<number>(500000);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('MTN Mobile Money');
  const [payRef, setPayRef] = useState<string>('MM260' + Math.floor(Math.random() * 899999 + 100000));
  const [payNotes, setPayNotes] = useState<string>('');

  // Receipt Modal for Print
  const [viewingReceipt, setViewingReceipt] = useState<FeePayment | null>(null);

  // Compute student balances
  const allFeeSummaries = useMemo(() => {
    return students.map((s) => getStudentFeeSummary(s.id));
  }, [students, getStudentFeeSummary]);

  const filteredSummaries = useMemo(() => {
    return allFeeSummaries.filter((sum) => {
      const matchSearch =
        sum.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sum.student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = classFilter === 'All' || sum.student.className === classFilter;
      return matchSearch && matchClass;
    });
  }, [allFeeSummaries, searchTerm, classFilter]);

  // Overall statistics
  const totalBilledAll = allFeeSummaries.reduce((sum, s) => sum + s.totalBilled, 0);
  const totalPaidAll = allFeeSummaries.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalOutstandingAll = allFeeSummaries.reduce((sum, s) => sum + s.balance, 0);
  const collectionRate = totalBilledAll > 0 ? Math.round((totalPaidAll / totalBilledAll) * 100) : 0;

  // Handle submit payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPay || payAmount <= 0) return;

    const receiptNo = addPayment({
      studentId: selectedStudentForPay,
      amountPaid: payAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: payMethod,
      referenceNumber: payRef || `REF-${Date.now()}`,
      term: currentSchool.currentTerm,
      academicYear: currentSchool.currentAcademicYear,
      receivedBy: 'Bursar Window',
      notes: payNotes || 'School fees installment',
    });

    const newPaymentObj = {
      id: `pay-${Date.now()}`,
      schoolId: currentSchool.id,
      receiptNumber: receiptNo,
      studentId: selectedStudentForPay,
      amountPaid: payAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: payMethod,
      referenceNumber: payRef,
      term: currentSchool.currentTerm,
      academicYear: currentSchool.currentAcademicYear,
      receivedBy: 'Bursar Window',
      notes: payNotes,
    };

    setShowPaymentModal(false);
    setViewingReceipt(newPaymentObj);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 no-print">
        <div>
          <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
            Bursar's Office & Financial Accounts
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Fees & Revenue Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Currency: Ugandan Shillings (UGX) · Term {currentSchool.currentTerm}, {currentSchool.currentAcademicYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPayRef('MM260' + Math.floor(Math.random() * 899999 + 100000));
              setShowPaymentModal(true);
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Record Fee Payment
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Term Fees Billed</span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {formatUGX(totalBilledAll)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Based on student residence</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Fees Collected</span>
          <div className="text-xl font-bold text-emerald-700 mt-1 font-mono tabular-nums">
            {formatUGX(totalPaidAll)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {collectionRate}% collection efficiency
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Outstanding Balances</span>
          <div className="text-xl font-bold text-rose-700 mt-1 font-mono tabular-nums">
            {formatUGX(totalOutstandingAll)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {allFeeSummaries.filter((s) => s.balance > 0).length} students with unpaid fees
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Verified Receipts Issued</span>
          <div className="text-xl font-bold text-blue-950 mt-1 font-mono tabular-nums">
            {payments.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">MoMo, Bank slips, & Cash</div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 no-print">
        <button
          onClick={() => setActiveFinanceTab('balances')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeFinanceTab === 'balances'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Fee Balances & Defaulters Ledger
        </button>
        <button
          onClick={() => setActiveFinanceTab('payments')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeFinanceTab === 'payments'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Payment Transactions & Receipts ({payments.length})
        </button>
        <button
          onClick={() => setActiveFinanceTab('structure')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeFinanceTab === 'structure'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Fee Structures per Class
        </button>
      </div>

      {/* TAB 1: BALANCES LEDGER */}
      {activeFinanceTab === 'balances' && (
        <div className="space-y-4 no-print">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pupil name, admission no..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
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
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Admission No</th>
                    <th className="py-2.5 px-3">Pupil Name</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Residence</th>
                    <th className="py-2.5 px-3 text-right">Total Billed</th>
                    <th className="py-2.5 px-3 text-right">Paid (UGX)</th>
                    <th className="py-2.5 px-3 text-right">Balance Due</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSummaries.map((sum) => (
                    <tr key={sum.student.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {sum.student.admissionNumber}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {sum.student.fullName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {sum.student.className} {sum.student.stream}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {sum.student.residenceType}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {formatUGX(sum.totalBilled)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-800 tabular-nums">
                        {formatUGX(sum.totalPaid)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-rose-700">
                        {formatUGX(sum.balance)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-semibold text-[11px] ${
                            sum.status === 'Fully Paid'
                              ? 'text-emerald-700'
                              : sum.status === 'Partial'
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {sum.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudentForPay(sum.student.id);
                            setPayAmount(sum.balance > 0 ? sum.balance : 200000);
                            setShowPaymentModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
                        >
                          Receive Cash/MoMo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS & VERIFIED RECEIPTS */}
      {activeFinanceTab === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden no-print">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Receipt No</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Channel / Method</th>
                  <th className="py-2.5 px-3">Reference / Slip</th>
                  <th className="py-2.5 px-3 text-right">Amount (UGX)</th>
                  <th className="py-2.5 px-3 text-right">Print Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((pay) => {
                  const student = students.find((s) => s.id === pay.studentId);
                  return (
                    <tr key={pay.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-950">
                        {pay.receiptNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono">{pay.paymentDate}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {student ? student.fullName : 'Pupil'} ({student?.className})
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {pay.paymentMethod}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{pay.referenceNumber}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                        {formatUGX(pay.amountPaid)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setViewingReceipt(pay)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 flex items-center gap-1 ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FEE STRUCTURES */}
      {activeFinanceTab === 'structure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
          {feeStructures.map((struct) => (
            <div key={struct.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Fee Structure · Class {struct.className}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Term {struct.term}, Academic Year {struct.academicYear}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500">Total Day Scholar</div>
                  <div className="font-bold font-mono text-blue-950 text-sm">
                    {formatUGX(struct.totalDayAmount)}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 my-3 text-xs">
                {struct.items.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between items-center">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {formatUGX(item.amount)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-900">
                <span>Total Boarding Student:</span>
                <span className="font-mono text-indigo-900 text-sm">
                  {formatUGX(struct.totalBoardingAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden text-xs">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">
                Record School Fees Payment (UGX)
              </h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Pupil / Student *
                </label>
                <select
                  value={selectedStudentForPay}
                  onChange={(e) => {
                    setSelectedStudentForPay(e.target.value);
                    const sum = getStudentFeeSummary(e.target.value);
                    if (sum && sum.balance > 0) setPayAmount(sum.balance);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.className} {s.stream} · {s.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Amount Received (UGX) *
                </label>
                <input
                  type="number"
                  step="10000"
                  min="5000"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-mono font-bold text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Method / Channel *
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-medium"
                >
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Bank Deposit">Bank Deposit Slip (Centenary/Stanbic/Equity)</option>
                  <option value="Cash">Cash at Bursar Window</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transaction Reference / Slip Number *
                </label>
                <input
                  type="text"
                  required
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. MM260341829 or STAN-SLIP-4820"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bursar Remarks / Narrative
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Term 2 tuition completion"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3.5 py-1.5 font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm & Issue Official Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL UGANDAN SCHOOL RECEIPT POPUP */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-900 max-w-lg w-full p-6 text-slate-900 font-sans print-page">
            <div className="text-center pb-3 border-b-2 border-slate-900">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Republic of Uganda
              </div>
              <h2 className="text-xl font-extrabold uppercase text-slate-900 mt-0.5">
                {currentSchool.name}
              </h2>
              <p className="text-[11px] text-slate-600 italic">
                {currentSchool.address} · Tel: {currentSchool.phone} · EMIS: {currentSchool.emisNumber}
              </p>
              <div className="inline-block mt-2 px-4 py-0.5 bg-slate-100 border border-slate-900 text-xs font-bold uppercase">
                Official School Fees Receipt
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 my-4 text-xs">
              <div>
                <span className="text-slate-500">Receipt No:</span>{' '}
                <span className="font-bold font-mono text-blue-950">{viewingReceipt.receiptNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Date:</span>{' '}
                <span className="font-bold font-mono">{viewingReceipt.paymentDate}</span>
              </div>
              <div>
                <span className="text-slate-500">Learner's Name:</span>{' '}
                <span className="font-bold">
                  {students.find((s) => s.id === viewingReceipt.studentId)?.fullName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Admission No:</span>{' '}
                <span className="font-bold font-mono">
                  {students.find((s) => s.id === viewingReceipt.studentId)?.admissionNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Class & Stream:</span>{' '}
                <span className="font-semibold">
                  {students.find((s) => s.id === viewingReceipt.studentId)?.className}{' '}
                  {students.find((s) => s.id === viewingReceipt.studentId)?.stream}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Academic Term:</span>{' '}
                <span className="font-semibold">
                  Term {viewingReceipt.term}, {viewingReceipt.academicYear}
                </span>
              </div>
            </div>

            <div className="p-3 my-3 bg-slate-50 border border-slate-300 rounded text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Channel:</span>
                <span className="font-bold">{viewingReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Reference / Slip ID:</span>
                <span className="font-mono font-medium">{viewingReceipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">Total Amount Received:</span>
                <span className="font-extrabold font-mono text-blue-950">
                  {formatUGX(viewingReceipt.amountPaid)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end mt-6 pt-3 border-t border-slate-300 text-xs">
              <div>
                <div className="w-24 h-12 border-2 border-dashed border-slate-400 rounded flex items-center justify-center text-[9px] text-slate-500 uppercase tracking-widest text-center">
                  BURSAR'S STAMP
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">{viewingReceipt.receivedBy}</div>
                <div className="text-[10px] text-slate-500">Authorized Bursar / Accounts</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-200 no-print">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-3 py-1.5 text-xs text-slate-600 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 text-xs bg-blue-900 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
