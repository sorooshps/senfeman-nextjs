'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FaSearch, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import Layout from '../../../components/Layout';
import { getAnnouncementMessages, createAnnouncementMessage } from '../../../api/announcement';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import bg from '../../../assets/fonts/bg.png'
// Jalali date conversion helpers
const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

const toJalali = (gy, gm, gd) => {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + (Math.floor((gy2 + 3) / 4)) - (Math.floor((gy2 + 99) / 100)) + (Math.floor((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * (Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * (Math.floor(days / 1461));
  days %= 1461;
  jy += Math.floor((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  const jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return { year: jy, month: jm, day: jd };
};

const formatJalaliDateFull = (dateString) => {
  const date = new Date(dateString);
  const jalali = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${jalali.day} ${persianMonths[jalali.month - 1]} ${jalali.year}`;
};

const formatJalaliDateShort = (dateString) => {
  const date = new Date(dateString);
  const jalali = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${jalali.year}/${String(jalali.month).padStart(2, '0')}/${String(jalali.day).padStart(2, '0')}`;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
};

const getDateKey = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export default function AnnouncementsPage() {
  const { isAuthenticated, loading, getToken } = useAuth('wholesaler');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Refs
  const hasFetched = useRef(false);
  const messagesEndRef = useRef(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (hasFetched.current) return;
    
    const token = getToken();
    if (!token) return;

    hasFetched.current = true;
    setLoadingMessages(true);
    
    try {
      const response = await getAnnouncementMessages(token, { page_size: 100 });
      const msgs = response.results || response || [];
      setMessages(msgs);
      if (msgs.length > 0) {
        setLastUpdate(msgs[0].created_at);
      }
    } catch {
      // Silent error - user will see empty state
    } finally {
      setLoadingMessages(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isAuthenticated && !hasFetched.current) {
      fetchMessages();
    }
  }, [isAuthenticated, fetchMessages]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    // Sort messages by date ascending (oldest first for chat view)
    const sorted = [...messages].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );

    const groups = {};
    sorted.forEach(message => {
      const dateKey = getDateKey(message.created_at);
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: message.created_at,
          dateLabel: formatJalaliDateFull(message.created_at),
          messages: []
        };
      }
      groups[dateKey].messages.push(message);
    });

    return Object.values(groups);
  }, [messages]);

  // Filter messages by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedMessages;
    
    return groupedMessages.map(group => ({
      ...group,
      messages: group.messages.filter(msg => 
        msg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.sender_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(group => group.messages.length > 0);
  }, [groupedMessages, searchQuery]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (loading) {
    return (
      <Layout pageTitle="تابلوی اعلانات">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Send new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSendingMessage(true);
    try {
      const token = getToken();
      await createAnnouncementMessage(newMessage, token);
      
      // Add the message to the messages list
      const newMsg = {
        id: Date.now(), // Temporary ID
        text: newMessage,
        sender_name: 'شما',
        created_at: new Date().toISOString()
      };
      
      setMessages(prevMessages => [newMsg, ...prevMessages]);
      setNewMessage('');
      setLastUpdate(new Date().toISOString());
      toast.success('پیام با موفقیت ارسال شد');
      
      // Refetch messages to get the actual message with server ID
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('خطا در ارسال پیام');
    } finally {
      setSendingMessage(false);
    }
  };
  
  return (
    <Layout pageTitle="تابلوی اعلانات">
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div 
        className="min-h-screen flex flex-col"
        style={{
          backgroundImage: `url(${bg.src})`,
          backgroundSize:'cover',
          backgroundPosition:'center',
          backgroundRepeat:'repeat'
        }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Search Input */}
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی پیام ..."
                  className="w-48 md:w-64 pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Title and Last Update */}
            <div className="text-left">
              <h1 className="text-lg font-semibold text-gray-800">تابلوی اعلانات</h1>
              {lastUpdate && (
                <p className="text-xs text-gray-500">
                  روز رسانی در {formatTime(lastUpdate)} • {formatJalaliDateShort(lastUpdate)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          {loadingMessages ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">هیچ اعلانی وجود ندارد</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* Date Separator */}
                  <div className="flex justify-center mb-4">
                    <div className="px-4 py-1.5 bg-white rounded-full shadow-sm text-xs text-gray-600 border border-gray-100">
                      {group.dateLabel}
                    </div>
                  </div>

                  {/* Messages for this date */}
                  <div className="space-y-3">
                    {group.messages.map((message) => (
                      <div key={message.id} className="flex justify-end">
                        <div className="flex items-end gap-2 max-w-[75%] md:max-w-[70%]">
                          {/* Time */}
                          <span className="text-xs text-gray-400 mb-1 whitespace-nowrap">
                            {formatTime(message.created_at)}
                          </span>

                          {/* Message Bubble */}
                          <div className="bg-[#f8f4ef] rounded-2xl rounded-br-md px-4 py-3 shadow-sm border border-gray-100 min-w-0">
                            {/* Sender Name */}
                            <div className="flex items-center justify-end mb-2">
                              <span className="text-sm font-semibold text-blue-600">
                                {message.sender_name || 'عمده فروش آریا'}
                              </span>
                            </div>

                            {/* Message Text */}
                            <p className="text-sm text-gray-700 leading-relaxed text-right whitespace-pre-wrap break-all md:break-words">
                              {message.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="پیام جدید بنویسید..."
                className="flex-1 p-3 bg-gray-100 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={sendingMessage}
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !newMessage.trim()}
                className={`p-3 rounded-r-lg ${sendingMessage || !newMessage.trim() ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
              >
                <FaPaperPlane className={sendingMessage ? 'animate-pulse' : ''} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Invisible element for scrolling */}
        <div ref={messagesEndRef} />
      </div>
    </Layout>
  );
}
