'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaTimes, FaCheck } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import Layout from '../../../components/Layout';
import {
  getAnnouncementMessages,
  createAnnouncementMessage,
  updateAnnouncementMessage,
  deleteAnnouncementMessage,
} from '../../../api/announcement';

// Jalali date formatter
const formatJalaliDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export default function NotesPage() {
  const { isAuthenticated, loading, getToken } = useAuth('wholesaler');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch messages
  const fetchMessages = async () => {
    const token = getToken();
    if (!token) return;

    setLoadingMessages(true);
    try {
      const response = await getAnnouncementMessages(token, { page_size: 100 });
      setMessages(response.results || response || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('خطا در دریافت یادداشت‌ها');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated]);

  // Create new message
  const handleCreate = async () => {
    if (!newMessageText.trim()) return;

    const token = getToken();
    if (!token) return;

    setSubmitting(true);
    setError(null);
    try {
      await createAnnouncementMessage(newMessageText.trim(), token);
      setNewMessageText('');
      setShowCreateModal(false);
      fetchMessages();
    } catch (err) {
      console.error('Failed to create message:', err);
      setError(err.message || 'خطا در ایجاد یادداشت');
    } finally {
      setSubmitting(false);
    }
  };

  // Update message
  const handleUpdate = async () => {
    if (!editingMessage || !newMessageText.trim()) return;

    const token = getToken();
    if (!token) return;

    setSubmitting(true);
    setError(null);
    try {
      await updateAnnouncementMessage(editingMessage.id, newMessageText.trim(), token);
      setNewMessageText('');
      setEditingMessage(null);
      fetchMessages();
    } catch (err) {
      console.error('Failed to update message:', err);
      setError(err.message || 'خطا در ویرایش یادداشت');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete message
  const handleDelete = async (id) => {
    const token = getToken();
    if (!token) return;

    if (!confirm('آیا از حذف این یادداشت اطمینان دارید؟')) return;

    try {
      await deleteAnnouncementMessage(id, token);
      fetchMessages();
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError(err.message || 'خطا در حذف یادداشت');
    }
  };

  // Open edit modal
  const openEditModal = (message) => {
    setEditingMessage(message);
    setNewMessageText(message.text);
  };

  // Close modals
  const closeModal = () => {
    setShowCreateModal(false);
    setEditingMessage(null);
    setNewMessageText('');
    setError(null);
  };

  if (loading) {
    return (
      <Layout pageTitle="افزودن یادداشت">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout pageTitle="افزودن یادداشت">
      <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">افزودن یادداشت</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              <span>یادداشت جدید</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Notes Grid */}
        {loadingMessages ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">هیچ یادداشتی وجود ندارد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(message)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                    >
                      <FaEdit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <FaTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">{formatJalaliDate(message.created_at)}</span>
                </div>

                {/* Card Title */}
                <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-1">
                  اظهار نگرانی درباره موجودی
                </h3>

                {/* Card Content */}
                <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed">
                  {message.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingMessage) && (
          <div className="fixed inset-0 bg-gradient-to-br from-gray-500/50 to-gray-700/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingMessage ? 'ویرایش یادداشت' : 'یادداشت جدید'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <textarea
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="متن یادداشت را وارد کنید..."
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  dir="rtl"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  انصراف
                </button>
                <button
                  onClick={editingMessage ? handleUpdate : handleCreate}
                  disabled={submitting || !newMessageText.trim()}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FaCheck className="w-3 h-3" />
                      <span>{editingMessage ? 'ذخیره' : 'ایجاد'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
