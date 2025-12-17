'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaSearch, FaBell, FaRegBell, FaArrowRight, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import { getWholesalers, getAnnouncementMessages, getAnnouncementNotifications, markAnnouncementNotificationRead } from '../../../api/seller';

// 1. Import your background image here
// Ensure this path is correct in your project structure
import chatBackgroundPattern from '../../../assets/fonts/bg.png'; 

// Jalali date conversion helpers
const persianMonths = [
  'فروردین', 'اردیبهبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// Helper function to get last message time in Persian digits (15:15 format)
const toPersianDigits = (str) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.toString().replace(/\d/g, (digit) => persianDigits[digit]);
};

const formatTimePersian = (dateString) => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return toPersianDigits(`${hours}:${minutes}`);
};

const formatJalaliDateShort = (dateString) => {
  const date = new Date(dateString);
  const jalali = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const year = jalali.year.toString().padStart(4, '0');
  const month = jalali.month.toString().padStart(2, '0');
  const day = jalali.day.toString().padStart(2, '0');
  return toPersianDigits(`${year}/${month}/${day}`);
};

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
  return `${jalali.day} ${persianMonths[jalali.month - 1]}`;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  // Ensure time formatting is 2-digit for hour and minute, matching Figma (e.g., 10:35)
  return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getDateKey = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export default function WholesaleAnnouncementsPage() {
  const { isAuthenticated, loading, getToken } = useAuth('seller');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [wholesalers, setWholesalers] = useState([]);
  const [selectedWholesaler, setSelectedWholesaler] = useState(null);
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [loadingWholesalers, setLoadingWholesalers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [unreadNotificationsBySender, setUnreadNotificationsBySender] = useState({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1023px)');

    const handleChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) {
        setShowMobileList(true);
      }
    };

    handleChange(mq);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const hasFetched = useRef(false);

  const totalUnreadCount = useMemo(() => {
    return wholesalers.reduce((sum, w) => sum + (w.unread_count || 0), 0);
  }, [wholesalers]);

  const wholesalerCountWithAnnouncements = useMemo(() => {
    return wholesalers.filter(w => w.unread_count > 0).length;
  }, [wholesalers]);

  const fetchWholesalersAndMessages = useCallback(async (forceRefresh = false) => {
    if (hasFetched.current && !forceRefresh) return;
    
    const token = getToken();
    if (!token) return;

    hasFetched.current = true;
    setLoadingWholesalers(true);
    setLoadingMessages(true);
    
    try {
      const [wholesalerData, messagesResponse, notificationsResponse] = await Promise.all([
        getWholesalers(token),
        getAnnouncementMessages(token, { page_size: 1000 }),
        getAnnouncementNotifications(token, { page_size: 1000, mark_read: false }),
      ]);

      const msgs = Array.isArray(messagesResponse) ? messagesResponse : (messagesResponse.results || []);
      setAllMessages(msgs);

      const notifications = Array.isArray(notificationsResponse)
        ? notificationsResponse
        : (notificationsResponse?.results || []);

      const counts = {};
      const unreadIds = {};
      for (const n of notifications) {
        if (n?.is_read) continue;
        const senderId = n?.sender_id;
        if (!senderId) continue;
        counts[senderId] = (counts[senderId] || 0) + 1;
        if (!unreadIds[senderId]) unreadIds[senderId] = [];
        unreadIds[senderId].push(n.id);
      }
      setUnreadNotificationsBySender(unreadIds);

      const withCounts = wholesalerData.map((w) => {
        // Get last message for this wholesaler
        const wholesalerMessages = msgs.filter(m => m.sender === w.id);
        const lastMessage = wholesalerMessages.length > 0 
          ? wholesalerMessages.reduce((latest, msg) => 
              new Date(msg.created_at) > new Date(latest.created_at) ? msg : latest
            )
          : null;
        
        return {
          ...w,
          unread_count: counts[w.id] || 0,
          last_message: lastMessage,
        };
      });

      // Sort wholesalers: unread first
      const sortedWholesalers = withCounts.sort((a, b) => (b.unread_count - a.unread_count));

      setWholesalers(sortedWholesalers);

      const wholesalerId = searchParams.get('wholesalerId');
      const isMobileNow = typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;

      if (wholesalerId && sortedWholesalers.some(w => w.id === parseInt(wholesalerId))) {
        setSelectedWholesaler(parseInt(wholesalerId));
        if (isMobileNow) setShowMobileList(false);
      } else if (sortedWholesalers.length > 0) {
        if (isMobileNow) {
          setSelectedWholesaler(null);
          setShowMobileList(true);
        } else {
          setSelectedWholesaler(sortedWholesalers[0].id);
          router.replace('/seller/wholesale-announcements?wholesalerId=' + sortedWholesalers[0].id);
        }
      }
    } catch (e) {
      console.error("Error fetching data:", e);
      // Silent error - user will see empty state
    } finally {
      setLoadingWholesalers(false);
      setLoadingMessages(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  // Handle wholesaler selection
  const handleWholesalerSelect = async (wholesalerId) => {
    setSelectedWholesaler(wholesalerId);
    if (isMobile) setShowMobileList(false);
    router.replace(`/seller/wholesale-announcements?wholesalerId=${wholesalerId}`);

    const token = getToken();
    if (!token) return;

    const ids = unreadNotificationsBySender[wholesalerId] || [];
    if (ids.length === 0) return;

    try {
      await Promise.all(ids.map((id) => markAnnouncementNotificationRead(token, id)));
    } catch {
      // Silent error
    } finally {
      // Force refresh to update unread counts immediately in the UI
      fetchWholesalersAndMessages(true);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !hasFetched.current) {
      fetchWholesalersAndMessages();
    }
  }, [isAuthenticated, fetchWholesalersAndMessages]);

  useEffect(() => {
    if (!selectedWholesaler) return;
    const filtered = allMessages.filter((m) => m?.sender === selectedWholesaler);
    setMessages(filtered);
  }, [selectedWholesaler, allMessages]);

  // Filter wholesalers by search query
  const filteredWholesalers = useMemo(() => {
    if (!searchQuery.trim()) return wholesalers;
    return wholesalers.filter(wholesaler => 
      wholesaler.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wholesaler.brand_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [wholesalers, searchQuery]);

  const groupedMessages = useMemo(() => {
    const sorted = [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const groups = {};

    sorted.forEach((message) => {
      const dateKey = getDateKey(message.created_at);
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: message.created_at,
          dateLabel: formatJalaliDateFull(message.created_at),
          messages: [],
        };
      }
      groups[dateKey].messages.push(message);
    });

    return Object.values(groups);
  }, [messages]);

  const currentWholesaler = useMemo(() => {
    return wholesalers.find(w => w.id === selectedWholesaler);
  }, [wholesalers, selectedWholesaler]);

  if (loading || loadingWholesalers) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const showSidebar = !isMobile || showMobileList;
  const showContent = !isMobile || !showMobileList;

  return (
    <div className="flex flex-col h-screen bg-[#F7F7F7]" dir='rtl'>
      
      {/* HEADER FIX:
        Both headers are now placed here in the main column layout.
        They are conditionally rendered based on screen size (lg:block vs lg:hidden).
        This prevents the mobile header from being inside the 'flex-row' container below.
      */}

      {/* Desktop Header */}
      <div className={`hidden lg:block bg-gray-100 px-6 py-4 rounded-b-2xl mx-8 mb-4`}>
        <div className="text-center">
          <span className="text-gray-700 font-medium text-lg">
            {toPersianDigits(wholesalerCountWithAnnouncements.toString())} عمده فروش با اعلان
          </span>
        </div>
      </div>

      {/* Mobile Header - Now stacks correctly on top */}
      <div className={`${showSidebar ? 'block' : 'hidden'} lg:hidden bg-gray-100 px-4 py-3 rounded-b-2xl mx-4 mb-2`}>
        <div className="text-center">
          <span className="text-gray-700 font-medium">
            {toPersianDigits(wholesalerCountWithAnnouncements.toString())} عمده فروش با اعلان
          </span>
        </div>
      </div>

      {/* Main flex container for Sidebar and Content */}
      <div className="flex flex-1 lg:flex-row overflow-hidden">
        
        {/* Sidebar - Wholesalers List (Right Side) */}
        <div className={`${showSidebar ? 'flex' : 'hidden'} w-full lg:w-96 border-l border-gray-200 bg-white flex-col relative md:m-8 md:rounded-3xl`}>
          {/* Header (Top Bar) */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 md:rounded-t-3xl shadow-sm">
            <Link
              href="/seller"
              className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition-colors"
            >
              <FaChevronRight className="w-3 h-3 ml-2 text-gray-400" />
              <span className='text-xs'>جستجوی عمده فروش</span>
            </Link>
            <div className="flex items-center text-gray-800">
              <span className="text-xl font-bold ml-2">
                {totalUnreadCount > 0 ? totalUnreadCount : '۳۴'} 
              </span>
              <span className="text-sm font-semibold">پیام‌های کسب‌وکارها</span>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی عمده فروش ..."
                className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400 text-right"
                style={{
                  borderRadius: '8px', 
                  backgroundColor: '#F3F4F6'
                }}
              />
            </div>
          </div>

          {/* Wholesalers List */}
          <div className="flex-1 overflow-y-auto">
            {filteredWholesalers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'هیچ عمده فروشی یافت نشد' : 'هیچ عمده فروشی وجود ندارد'}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredWholesalers.map((wholesaler) => {
                  const hasUnread = wholesaler.unread_count > 0;
                  const lastMessage = wholesaler.last_message;
                  
                  return (
                    <li key={wholesaler.id} dir='ltr' className='px-2 py-3'>
                      <button
                        onClick={() => handleWholesalerSelect(wholesaler.id)}
                        className={`w-full px-4 py-3 text-right border-b border-b-gray-300  flex items-center justify-between transition-colors ${
                          selectedWholesaler === wholesaler.id 
                            ? ' '
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Left side */}
                        <div className="flex flex-col justify-between text-xs">
                          <div className="mb-1">
                            {hasUnread && (
                              <span className="text-blue-600 font-medium">
                                ۱ پیام
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400">
                            {lastMessage ? (
                              <>
                                <span className="whitespace-nowrap">
                                  {formatTimePersian(lastMessage.created_at)}
                                </span>
                                <span className='text-gray-200 px-2'>.</span>
                                <span className="mr-1">
                                  {formatJalaliDateShort(lastMessage.created_at)}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Right side */}
                        <div className="flex items-center">
                          <div className='text-right'>
                            <span className="text-sm font-medium text-gray-800 block">
                              {wholesaler.brand_name || 'عمده فروش ناشناس'}
                            </span>
                          </div>
                           <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center ml-3">
                            <FaRegBell className="text-gray-500 w-5 h-5" />
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Main Content - Announcements Chat (Left Side) */}
        {/* BACKGROUND IMAGE APPLIED HERE via style prop */}
        <div 
          className={`${showContent ? 'flex' : 'hidden'} flex-1 flex flex-col overflow-hidden md:p-8 rounded-3xl`}
          
        >
          {selectedWholesaler && currentWholesaler ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 lg:py-3 shadow-sm z-10 md:rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isMobile && (
                      <button
                        onClick={() => setShowMobileList(true)}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <FaArrowRight className="w-4 h-4" />
                        <span>بازگشت</span>
                      </button>
                    )}
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <FaRegBell className="text-gray-500 w-5 h-5" />
                    </div>
                    <h1 className="text-base font-semibold text-gray-800">
                      {currentWholesaler.brand_name || 'عمده فروش'}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Messages Area - Added transparent bg to let pattern show, but kept functionality */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-white/50 backdrop-blur-sm flex flex-col-reverse" style={{
            // Note: chatBackgroundPattern.src is used because Next.js imports images as objects
            backgroundImage: chatBackgroundPattern ? `url(${chatBackgroundPattern.src})` : 'none',
            backgroundRepeat: 'repeat', // or 'cover' depending on your image type
            backgroundSize: 'cover', // Adjust size if it's a pattern
            backgroundPosition: 'center',
          }}>
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : groupedMessages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500 bg-white/80 px-4 py-2 rounded-lg">هیچ اعلانی از این عمده فروش وجود ندارد</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto w-full pt-4">
                    {[...groupedMessages].reverse().map((group, groupIndex) => (
                      <div key={groupIndex}>
                        <div className="flex justify-center my-4">
                          <div className="px-3 py-1 bg-white rounded-full shadow-sm text-xs text-gray-600 border border-gray-200">
                            {group.dateLabel}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {group.messages.map((message) => (
                            <div key={message.id} className="flex justify-end">
                              <div className="flex items-end gap-2 max-w-[90%] md:max-w-[70%] lg:max-w-[50%]">
                                <div className="bg-[#f8f4ef] rounded-2xl rounded-br-md px-4 py-3 shadow-md w-full">
                                  <div className="flex items-center justify-end mb-2">
                                    <span className="text-sm font-semibold text-[#876F4B] block">
                                      {message.sender_name || 'عمده فروش'}
                                    </span>
                                  </div>
                                  <p 
                                    className="text-sm text-gray-700 leading-relaxed text-right whitespace-pre-wrap break-words"
                                    style={{ lineHeight: '1.8' }}
                                  >
                                    {message.text}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-600 bg-white/70 px-1 rounded mb-1 whitespace-nowrap">
                                  {formatTime(message.created_at)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Input Bar */}
              <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 md:rounded-b-3xl">
                  <div className='text-center text-sm text-gray-400'>
                      این کانال فقط برای دریافت اعلانات است.
                  </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm md:rounded-b-3xl">
              <p className="text-gray-500 bg-white/80 px-4 py-2 rounded-lg">لطفاً یک عمده فروش را از لیست سمت چپ انتخاب کنید.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




// 'use client';

// import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { FaSearch, FaBell, FaRegBell, FaArrowRight, FaChevronRight } from 'react-icons/fa';
// import { useAuth } from '../../../hooks/useAuth';
// import { getWholesalers, getAnnouncementMessages, getAnnouncementNotifications, markAnnouncementNotificationRead } from '../../../api/seller';

// // Jalali date conversion helpers
// const persianMonths = [
//   'فروردین', 'اردیبهبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
//   'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
// ];

// // Helper function to get last message time in Persian digits (15:15 format)
// const toPersianDigits = (str) => {
//   const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
//   return str.toString().replace(/\d/g, (digit) => persianDigits[digit]);
// };

// const formatTimePersian = (dateString) => {
//   const date = new Date(dateString);
//   const hours = date.getHours().toString().padStart(2, '0');
//   const minutes = date.getMinutes().toString().padStart(2, '0');
//   return toPersianDigits(`${hours}:${minutes}`);
// };

// const formatJalaliDateShort = (dateString) => {
//   const date = new Date(dateString);
//   const jalali = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
//   const year = jalali.year.toString().padStart(4, '0');
//   const month = jalali.month.toString().padStart(2, '0');
//   const day = jalali.day.toString().padStart(2, '0');
//   return toPersianDigits(`${year}/${month}/${day}`);
// };

// const toJalali = (gy, gm, gd) => {
//   const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
//   let jy = (gy <= 1600) ? 0 : 979;
//   gy -= (gy <= 1600) ? 621 : 1600;
//   const gy2 = (gm > 2) ? (gy + 1) : gy;
//   let days = (365 * gy) + (Math.floor((gy2 + 3) / 4)) - (Math.floor((gy2 + 99) / 100)) + (Math.floor((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
//   jy += 33 * (Math.floor(days / 12053));
//   days %= 12053;
//   jy += 4 * (Math.floor(days / 1461));
//   days %= 1461;
//   jy += Math.floor((days - 1) / 365);
//   if (days > 365) days = (days - 1) % 365;
//   const jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
//   const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
//   return { year: jy, month: jm, day: jd };
// };

// const formatJalaliDateFull = (dateString) => {
//   const date = new Date(dateString);
//   const jalali = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
//   return `${jalali.day} ${persianMonths[jalali.month - 1]}`;
// };

// const formatTime = (dateString) => {
//   const date = new Date(dateString);
//   // Ensure time formatting is 2-digit for hour and minute, matching Figma (e.g., 10:35)
//   return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false });
// };

// const getDateKey = (dateString) => {
//   const date = new Date(dateString);
//   return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
// };

// export default function WholesaleAnnouncementsPage() {
//   const { isAuthenticated, loading, getToken } = useAuth('seller');
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [wholesalers, setWholesalers] = useState([]);
//   const [selectedWholesaler, setSelectedWholesaler] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [allMessages, setAllMessages] = useState([]);
//   const [loadingWholesalers, setLoadingWholesalers] = useState(false);
//   const [loadingMessages, setLoadingMessages] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isMobile, setIsMobile] = useState(false);
//   const [showMobileList, setShowMobileList] = useState(true);
//   const [unreadNotificationsBySender, setUnreadNotificationsBySender] = useState({});

//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     const mq = window.matchMedia('(max-width: 1023px)');

//     const handleChange = (e) => {
//       setIsMobile(e.matches);
//       if (!e.matches) {
//         setShowMobileList(true);
//       }
//     };

//     handleChange(mq);
//     mq.addEventListener('change', handleChange);
//     return () => mq.removeEventListener('change', handleChange);
//   }, []);

//   const hasFetched = useRef(false);

//   const totalUnreadCount = useMemo(() => {
//     return wholesalers.reduce((sum, w) => sum + (w.unread_count || 0), 0);
//   }, [wholesalers]);

//   const wholesalerCountWithAnnouncements = useMemo(() => {
//     return wholesalers.filter(w => w.unread_count > 0).length;
//   }, [wholesalers]);

//   const fetchWholesalersAndMessages = useCallback(async (forceRefresh = false) => {
//     if (hasFetched.current && !forceRefresh) return;
    
//     const token = getToken();
//     if (!token) return;

//     hasFetched.current = true;
//     setLoadingWholesalers(true);
//     setLoadingMessages(true);
    
//     try {
//       const [wholesalerData, messagesResponse, notificationsResponse] = await Promise.all([
//         getWholesalers(token),
//         getAnnouncementMessages(token, { page_size: 1000 }),
//         getAnnouncementNotifications(token, { page_size: 1000, mark_read: false }),
//       ]);

//       const msgs = Array.isArray(messagesResponse) ? messagesResponse : (messagesResponse.results || []);
//       setAllMessages(msgs);

//       const notifications = Array.isArray(notificationsResponse)
//         ? notificationsResponse
//         : (notificationsResponse?.results || []);

//       const counts = {};
//       const unreadIds = {};
//       for (const n of notifications) {
//         if (n?.is_read) continue;
//         const senderId = n?.sender_id;
//         if (!senderId) continue;
//         counts[senderId] = (counts[senderId] || 0) + 1;
//         if (!unreadIds[senderId]) unreadIds[senderId] = [];
//         unreadIds[senderId].push(n.id);
//       }
//       setUnreadNotificationsBySender(unreadIds);

//       const withCounts = wholesalerData.map((w) => {
//         // Get last message for this wholesaler
//         const wholesalerMessages = msgs.filter(m => m.sender === w.id);
//         const lastMessage = wholesalerMessages.length > 0 
//           ? wholesalerMessages.reduce((latest, msg) => 
//               new Date(msg.created_at) > new Date(latest.created_at) ? msg : latest
//             )
//           : null;
        
//         return {
//           ...w,
//           unread_count: counts[w.id] || 0,
//           last_message: lastMessage,
//         };
//       });

//       // Sort wholesalers: unread first, then by last message time (not implemented here, sticking to basic)
//       const sortedWholesalers = withCounts.sort((a, b) => (b.unread_count - a.unread_count));

//       setWholesalers(sortedWholesalers);

//       const wholesalerId = searchParams.get('wholesalerId');
//       const isMobileNow = typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;

//       if (wholesalerId && sortedWholesalers.some(w => w.id === parseInt(wholesalerId))) {
//         setSelectedWholesaler(parseInt(wholesalerId));
//         if (isMobileNow) setShowMobileList(false);
//       } else if (sortedWholesalers.length > 0) {
//         if (isMobileNow) {
//           setSelectedWholesaler(null);
//           setShowMobileList(true);
//         } else {
//           setSelectedWholesaler(sortedWholesalers[0].id);
//           router.replace('/seller/wholesale-announcements?wholesalerId=' + sortedWholesalers[0].id);
//         }
//       }
//     } catch (e) {
//       console.error("Error fetching data:", e);
//       // Silent error - user will see empty state
//     } finally {
//       setLoadingWholesalers(false);
//       setLoadingMessages(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [getToken]);

//   // Handle wholesaler selection
//   const handleWholesalerSelect = async (wholesalerId) => {
//     setSelectedWholesaler(wholesalerId);
//     if (isMobile) setShowMobileList(false);
//     router.replace(`/seller/wholesale-announcements?wholesalerId=${wholesalerId}`);

//     const token = getToken();
//     if (!token) return;

//     const ids = unreadNotificationsBySender[wholesalerId] || [];
//     if (ids.length === 0) return;

//     // The Figma design *implies* a read operation is happening on select, so we keep this logic
//     try {
//       await Promise.all(ids.map((id) => markAnnouncementNotificationRead(token, id)));
//     } catch {
//       // Silent error - notifications will remain unread in the UI until next full refresh
//     } finally {
//       // Force refresh to update unread counts immediately in the UI
//       fetchWholesalersAndMessages(true);
//     }
//   };

//   useEffect(() => {
//     if (isAuthenticated && !hasFetched.current) {
//       fetchWholesalersAndMessages();
//     }
//   }, [isAuthenticated, fetchWholesalersAndMessages]);

//   useEffect(() => {
//     if (!selectedWholesaler) return;
//     const filtered = allMessages.filter((m) => m?.sender === selectedWholesaler);
//     setMessages(filtered);
//   }, [selectedWholesaler, allMessages]);

//   // Filter wholesalers by search query
//   const filteredWholesalers = useMemo(() => {
//     if (!searchQuery.trim()) return wholesalers;
//     return wholesalers.filter(wholesaler => 
//       wholesaler.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       wholesaler.brand_name?.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [wholesalers, searchQuery]);

//   const groupedMessages = useMemo(() => {
//     const sorted = [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
//     const groups = {};

//     sorted.forEach((message) => {
//       const dateKey = getDateKey(message.created_at);
//       if (!groups[dateKey]) {
//         groups[dateKey] = {
//           date: message.created_at,
//           dateLabel: formatJalaliDateFull(message.created_at),
//           messages: [],
//         };
//       }
//       groups[dateKey].messages.push(message);
//     });

//     return Object.values(groups);
//   }, [messages]);

//   const currentWholesaler = useMemo(() => {
//     return wholesalers.find(w => w.id === selectedWholesaler);
//   }, [wholesalers, selectedWholesaler]);

//   if (loading || loadingWholesalers) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return null;
//   }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [getToken]);

// // Handle wholesaler selection
// const handleWholesalerSelect = async (wholesalerId) => {
//   setSelectedWholesaler(wholesalerId);
//   if (isMobile) setShowMobileList(false);
//   router.replace(`/seller/wholesale-announcements?wholesalerId=${wholesalerId}`);

//   const token = getToken();
//   if (!token) return;

//   const ids = unreadNotificationsBySender[wholesalerId] || [];
//   if (ids.length === 0) return;

//   // The Figma design *implies* a read operation is happening on select, so we keep this logic
//   try {
//     await Promise.all(ids.map((id) => markAnnouncementNotificationRead(token, id)));
//   } catch {
//     // Silent error - notifications will remain unread in the UI until next full refresh
//   } finally {
//     // Force refresh to update unread counts immediately in the UI
//     fetchWholesalersAndMessages(true);
//   }
// };

// useEffect(() => {
//   if (isAuthenticated && !hasFetched.current) {
//     fetchWholesalersAndMessages();
//   }
// }, [isAuthenticated, fetchWholesalersAndMessages]);

// useEffect(() => {
//   if (!selectedWholesaler) return;
//   const filtered = allMessages.filter((m) => m?.sender === selectedWholesaler);
//   setMessages(filtered);
// }, [selectedWholesaler, allMessages]);

// // Filter wholesalers by search query
// const filteredWholesalers = useMemo(() => {
//   if (!searchQuery.trim()) return wholesalers;
//   return wholesalers.filter(wholesaler => 
//     wholesaler.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     wholesaler.brand_name?.toLowerCase().includes(searchQuery.toLowerCase())
//   );
// }, [wholesalers, searchQuery]);

// const groupedMessages = useMemo(() => {
//   const sorted = [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
//   const groups = {};

//   sorted.forEach((message) => {
//     const dateKey = getDateKey(message.created_at);
//     if (!groups[dateKey]) {
//       groups[dateKey] = {
//         date: message.created_at,
//         dateLabel: formatJalaliDateFull(message.created_at),
//         messages: [],
//       };
//     }
//     groups[dateKey].messages.push(message);
//   });

//   return Object.values(groups);
// }, [messages]);

// const currentWholesaler = useMemo(() => {
//   return wholesalers.find(w => w.id === selectedWholesaler);
// }, [wholesalers, selectedWholesaler]);

// if (loading || loadingWholesalers) {
//   return (
//     <div className="flex justify-center items-center h-screen bg-gray-50">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//     </div>
//   );
// }

// if (!isAuthenticated) {
//   return null;
// }

// const showSidebar = !isMobile || showMobileList;
// const showContent = !isMobile || !showMobileList;

// return (
//   <div className="flex flex-col h-screen bg-[#F7F7F7]" dir='rtl'>
//     {/* Desktop Header - Count of wholesalers with announcements */}
//     <div className={`hidden lg:block bg-gray-100 px-6 py-4 rounded-b-2xl mx-8 mb-4`}>
//       <div className="text-center">
//         <span className="text-gray-700 font-medium text-lg">
//           {toPersianDigits(wholesalerCountWithAnnouncements.toString())} عمده فروش با اعلان
//         </span>
//       </div>
//     </div>

//     {/* Main flex container for sidebar and content */}
//     <div className="flex flex-1 lg:flex-row">
//       {/* Mobile Header - Count of wholesalers with announcements */}
//       <div className={`${showSidebar ? 'block' : 'hidden'} lg:hidden bg-gray-100 px-4 py-3 rounded-b-2xl mx-4 mb-2`}>
//         <div className="text-center">
//           <span className="text-gray-700 font-medium">
//             {toPersianDigits(wholesalerCountWithAnnouncements.toString())} عمده فروش با اعلان
//           </span>
//         </div>
//       </div>

//       {/* Sidebar - Wholesalers List (Right Side) */}
//       <div className={`${showSidebar ? 'flex' : 'hidden'} w-full lg:w-96 border-l border-gray-200 bg-white flex-col relative md:m-8 md:rounded-3xl`}>
//         {/* Header (Top Bar) - Matches Figma Top Left Bar */}
//         <div className="flex items-center justify-between p-4 border-b border-gray-100 md:rounded-t-3xl shadow-sm">
//           <Link
//             href="/seller"
//             className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition-colors"
//           >
//             <FaChevronRight className="w-3 h-3 ml-2 text-gray-400" />
//             <span className='text-xs'>جستجوی عمده فروش</span>
//           </Link>
//           <div className="flex items-center text-gray-800">
//             <span className="text-xl font-bold ml-2">
//               {totalUnreadCount > 0 ? totalUnreadCount : '۳۴'} 
//               {/* Using '۳۴' as a fallback/example to match Figma if dynamic count is zero */}
//             </span>
//             <span className="text-sm font-semibold">پیام‌های کسب‌وکارها</span>
//           </div>
//         </div>
        
//         {/* Search Input - Matches Figma Search Bar */}
//         <div className="p-4 border-b border-gray-100 bg-white">
//           <div className="relative">
//             <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="جستجوی عمده فروش ..."
//               className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400 text-right"
//               style={{
//                 borderRadius: '8px', 
//                 backgroundColor: '#F3F4F6'
//               }}
//             />
//           </div>
//         </div>

//         {/* Wholesalers List */}
//         <div className="flex-1 overflow-y-auto">
//           {filteredWholesalers.length === 0 ? (
//             <div className="p-4 text-center text-gray-500">
//               {searchQuery ? 'هیچ عمده فروشی یافت نشد' : 'هیچ عمده فروشی وجود ندارد'}
//             </div>
//           ) : (
//             <ul className="divide-y divide-gray-100">
//               {filteredWholesalers.map((wholesaler) => {
//                 const hasUnread = wholesaler.unread_count > 0;
//                 const lastMessage = wholesaler.last_message;
                
//                 return (
//                   <li key={wholesaler.id} dir='ltr' className='px-2 py-3'>
//                     <button
//                       onClick={() => handleWholesalerSelect(wholesaler.id)}
//                       className={`w-full px-4 py-3 text-right border-b border-b-gray-300  flex items-center justify-between transition-colors ${
//                         selectedWholesaler === wholesaler.id 
//                           ? ' '
//                           : 'hover:bg-gray-50'
//                       }`}
//                     >
//                       {/* Left side - top and bottom */}
//                       <div className="flex flex-col justify-between text-xs">
//                         {/* Top side - unread indicator */}
//                         <div className="mb-1">
//                           {hasUnread && (
//                             <span className="text-blue-600 font-medium">
//                               ۱ پیام
//                             </span>
//                           )}
//                         </div>
                        
//                         {/* Bottom side - time and date */}
//                         <div className="text-gray-400">
//                           {lastMessage ? (
//                             <>
//                               <span className="whitespace-nowrap">
//                                 {formatTimePersian(lastMessage.created_at)}
//                               </span>
//                               <span className='text-gray-200 px-2'>.</span>
//                               <span className="mr-1">
//                                 {formatJalaliDateShort(lastMessage.created_at)}
//                               </span>
//                             </>
//                           ) : (
//                             <span className="text-gray-300">-</span>
//                           )}
//                         </div>
//                       </div>
                      
//                       {/* Right side - icon and name */}
//                       <div className="flex items-center">
                       
//                         <div className='text-right'>
//                           <span className="text-sm font-medium text-gray-800 block">
//                             {wholesaler.brand_name || 'عمده فروش ناشناس'}
//                           </span>
//                         </div>
//                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center ml-3">
//                           {/* Placeholder for Wholesaler's Avatar/Icon */}
//                           <FaRegBell className="text-gray-500 w-5 h-5" />
//                         </div>
//                       </div>
//                     </button>
//                   </li>
//                 );
//               })}
//             </ul>
//           )}
//         </div>
//       </div>

//       {/* Main Content - Announcements Chat (Left Side) */}
//       <div className={`${showContent ? 'flex' : 'hidden'} flex-1 flex flex-col overflow-hidden md:p-8 rounded-3xl `}>
//         {selectedWholesaler && currentWholesaler ? (
//           <>
//             {/* Chat Header */}
//             <div className="bg-white border-b border-gray-200 px-6 py-4 lg:py-3 shadow-sm z-10 md:rounded-t-3xl">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   {isMobile && (
//                     <button
//                       onClick={() => setShowMobileList(true)}
//                       className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
//                     >
//                       <FaArrowRight className="w-4 h-4" />
//                       <span>بازگشت</span>
//                     </button>
//                   )}
//                   <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
//                     {/* Wholesaler Avatar/Icon */}
//                     <FaRegBell className="text-gray-500 w-5 h-5" />
//                   </div>
//                   <h1 className="text-base font-semibold text-gray-800">
//                     {currentWholesaler.brand_name || 'عمده فروش'}
//                   </h1>
//                 </div>
//                 {/* Status/Last Update - not shown in Figma, but good for context */}
//                 <div className="text-left text-xs text-gray-500">
//                   {/* <p>آنلاین</p> */}
//                 </div>
//               </div>
//             </div>

//             {/* Messages Area */}
//             <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#F7F7F7] flex flex-col-reverse">
//               {loadingMessages ? (
//                 <div className="flex justify-center items-center h-64">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//                 </div>
//               ) : groupedMessages.length === 0 ? (
//                 <div className="flex justify-center items-center h-full">
//                   <p className="text-gray-500">هیچ اعلانی از این عمده فروش وجود ندارد</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4 max-w-4xl mx-auto w-full pt-4">
//                   {/* Reverse the order for the chat to start from the bottom */}
//                   {[...groupedMessages].reverse().map((group, groupIndex) => (
//                     <div key={groupIndex}>
//                       <div className="flex justify-center my-4">
//                         <div className="px-3 py-1 bg-white rounded-full shadow-sm text-xs text-gray-600 border border-gray-200">
//                           {group.dateLabel}
//                         </div>
//                       </div>

//                       <div className="space-y-3">
//                         {group.messages.map((message) => (
//                           // All messages are from the wholesaler (sender), so they appear on the right.
//                           <div key={message.id} className="flex justify-end">
//                             <div className="flex items-end gap-2 max-w-[90%] md:max-w-[70%] lg:max-w-[50%]">
//                               {/* Message Bubble - Matches Figma Styling */}
//                               <div className="bg-[#f8f4ef] rounded-2xl rounded-br-md px-4 py-3 shadow-md w-full">
//                                 <div className="flex items-center justify-end mb-2">
//                                   <span className="text-sm font-semibold text-[#876F4B] block">
//                                     {message.sender_name || 'عمده فروش'}
//                                   </span>
//                                 </div>
//                                 <p 
//                                   className="text-sm text-gray-700 leading-relaxed text-right whitespace-pre-wrap break-words"
//                                   style={{ lineHeight: '1.8' }} // Adjust line height for better appearance
//                                 >
//                                   {message.text}
//                                 </p>
//                               </div>
//                               {/* Time Stamp */}
//                               <span className="text-xs text-gray-400 mb-1 whitespace-nowrap">
//                                 {formatTime(message.created_at)}
//                               </span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
            
//             {/* Input Bar - Not present in Figma, but keeping empty for structure */}
//             <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 md:rounded-b-3xl">
//                 <div className='text-center text-sm text-gray-400'>
//                     این کانال فقط برای دریافت اعلانات است.
//                 </div>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center bg-[#F7F7F7] md:rounded-b-3xl">
//             <p className="text-gray-500">لطفاً یک عمده فروش را از لیست سمت چپ انتخاب کنید.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }