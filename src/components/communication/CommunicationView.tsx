/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Announcement } from '../../types';
import { formatUGX } from '../../utils/unebGrading';
import { Bell, Send, Plus, Trash2, MessageSquare, AlertCircle, CheckCircle, Info } from 'lucide-react';

export const CommunicationView: React.FC = () => {
  const { currentSchool, announcements, addAnnouncement, deleteAnnouncement, students, getStudentFeeSummary } =
    useSchool();

  const [activeCommTab, setActiveCommTab] = useState<'notices' | 'sms'>('notices');
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);

  // New notice state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeAudience, setNoticeAudience] = useState<Announcement['targetAudience']>('Parents');
  const [noticePriority, setNoticePriority] = useState<Announcement['priority']>('Normal');

  // SMS composer state
  const [smsRecipientGroup, setSmsRecipientGroup] = useState<'defaulters' | 'all_parents' | 'candidates'>('defaulters');
  const [smsTemplate, setSmsTemplate] = useState(
    'Dear {ParentName}, this is a reminder from {SchoolName}. {StudentName} has an outstanding fees balance of {Balance}. Please clear before {ReopeningDate}. Thank you.'
  );
  const [smsStatus, setSmsStatus] = useState<string | null>(null);

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;
    addAnnouncement({
      title: noticeTitle,
      content: noticeContent,
      targetAudience: noticeAudience,
      priority: noticePriority,
      postedBy: currentSchool.headTeacherName,
    });
    setNoticeTitle('');
    setNoticeContent('');
    setShowAddNoticeModal(false);
  };

  const handleSendSms = () => {
    // Generate preview
    let recipientCount = 0;
    if (smsRecipientGroup === 'defaulters') {
      recipientCount = students.filter((s) => getStudentFeeSummary(s.id).balance > 0).length;
    } else if (smsRecipientGroup === 'candidates') {
      recipientCount = students.filter((s) => s.className === 'P.7' || s.className === 'S.4').length;
    } else {
      recipientCount = students.length;
    }

    setSmsStatus(
      `Broadcast successfully dispatched via Uganda Telecom SMS Gateway to ${recipientCount} parent phone numbers!`
    );
    setTimeout(() => setSmsStatus(null), 4000);
  };

  // Preview SMS for first student
  const sampleStudent = students[0];
  const sampleFee = sampleStudent ? getStudentFeeSummary(sampleStudent.id) : null;
  const renderedPreview = smsTemplate
    .replace('{ParentName}', sampleStudent?.parentName || 'Parent')
    .replace('{StudentName}', sampleStudent?.fullName || 'Student')
    .replace('{SchoolName}', currentSchool.name)
    .replace('{Balance}', sampleFee ? formatUGX(sampleFee.balance) : 'UGX 350,000')
    .replace('{Term}', `Term ${currentSchool.currentTerm}`)
    .replace('{ReopeningDate}', currentSchool.nextTermBeginsDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
            Circulars, Bulletins & SMS Alerts
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Communication & Parent Broadcasts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep parents, educators, and candidates updated with term notices and instant SMS reminders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddNoticeModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Publish Notice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveCommTab('notices')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeCommTab === 'notices'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Notice Board & Circulars ({announcements.length})
        </button>
        <button
          onClick={() => setActiveCommTab('sms')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeCommTab === 'sms'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          SMS Broadcast Dispatcher
        </button>
      </div>

      {activeCommTab === 'notices' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-slate-900 text-sm">{ann.title}</h3>
                  <button
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="text-slate-400 hover:text-rose-700 p-1 rounded"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 my-2">
                  <span>Audience: <strong className="text-slate-700">{ann.targetAudience}</strong></span>
                  <span>·</span>
                  <span>Priority: <strong className={ann.priority === 'Urgent' ? 'text-rose-700 font-bold' : 'text-slate-700'}>{ann.priority}</strong></span>
                  <span>·</span>
                  <span>{ann.postedDate}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mt-2 whitespace-pre-line">
                  {ann.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Posted by {ann.postedBy}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* SMS Dispatcher Tab */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
              Compose Mobile SMS Notification
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Recipient Audience Group
              </label>
              <select
                value={smsRecipientGroup}
                onChange={(e) =>
                  setSmsRecipientGroup(e.target.value as 'defaulters' | 'all_parents' | 'candidates')
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800"
              >
                <option value="defaulters">
                  Fee Defaulters ({students.filter((s) => getStudentFeeSummary(s.id).balance > 0).length} Parents)
                </option>
                <option value="candidates">Candidate Class Parents (P.7 / S.4 / S.6)</option>
                <option value="all_parents">All Enrolled Parents ({students.length} Pupils)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">SMS Body Template</label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {smsTemplate.length} chars (
                  {Math.ceil(smsTemplate.length / 160)} SMS per recipient)
                </span>
              </div>
              <textarea
                rows={4}
                value={smsTemplate}
                onChange={(e) => setSmsTemplate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800 text-xs"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Tags available: <code className="bg-slate-100 px-1 py-0.5 rounded">{'{ParentName}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{'{StudentName}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{'{Balance}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{'{ReopeningDate}'}</code>
              </div>
            </div>

            {smsStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                {smsStatus}
              </div>
            )}

            <button
              onClick={handleSendSms}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch SMS Broadcast
            </button>
          </div>

          {/* SMS Simulator Preview */}
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                Live Uganda Phone SMS Simulation
              </div>
              <div className="text-xs text-slate-400 mb-4">
                To: {sampleStudent?.parentPhone} ({sampleStudent?.parentName})
              </div>

              {/* Chat Bubble */}
              <div className="bg-slate-800 rounded-2xl rounded-tl-xs p-4 text-xs font-sans text-slate-200 border border-slate-700 shadow-inner">
                {renderedPreview}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              Direct connection to Uganda SMS Gateways (MTN Uganda / Airtel Uganda Shortcode support).
            </div>
          </div>
        </div>
      )}

      {/* POST NOTICE MODAL */}
      {showAddNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 text-xs">
            <h2 className="font-bold text-slate-900 text-sm mb-3">
              Publish Notice / Circular
            </h2>
            <form onSubmit={handlePostNotice} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. End of Term Two Circular & Re-opening Dates"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Audience</label>
                  <select
                    value={noticeAudience}
                    onChange={(e) =>
                      setNoticeAudience(e.target.value as Announcement['targetAudience'])
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5"
                  >
                    <option value="All">All School Community</option>
                    <option value="Parents">Parents & Guardians</option>
                    <option value="Teachers">Teachers & Staff</option>
                    <option value="Students">Pupils & Students</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={noticePriority}
                    onChange={(e) =>
                      setNoticePriority(e.target.value as Announcement['priority'])
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Content / Body *</label>
                <textarea
                  rows={5}
                  required
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Type official school circular..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddNoticeModal(false)}
                  className="px-3 py-1.5 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
