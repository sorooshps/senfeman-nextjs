"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Bell,
  MessageCircle,
  MapPin,
  ChevronDown,
  HelpCircle,
  Search,
  Menu,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../assets/fonts/LOGO_SVG.svg";
import { getAnnouncementUnreadCount } from "../../../api/seller";
import { useAuth } from "../../../hooks/useAuth";

const SellerNavbar = () => {
  const router = useRouter();
  const { getToken } = useAuth('seller', { skipRoleRedirect: true });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      const token = getToken();
      if (!token) return;

      try {
        setIsLoading(true);
        const res = await getAnnouncementUnreadCount(token);
        setUnreadMessages(res?.unread_count || 0);
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCounts();
    
    // Refresh unread counts every 30 seconds
    const interval = setInterval(fetchUnreadCounts, 30000);
    
    return () => clearInterval(interval);
  }, [getToken]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);
  
  // Handle navigation to wholesale announcements
  const handleWholesaleMessagesClick = (e) => {
    e.preventDefault();
    router.push('/seller/wholesale-announcements');
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:block w-full bg-white border-b border-gray-200" dir="rtl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-16 flex items-center justify-between">
            
            {/* LEFT SIDE - Logo & Navigation */}
            <div className="flex items-center gap-8">
              {/* Brand */}
              <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50">
                  <Image 
                    src={logo} 
                    alt="صنف من" 
                    width={40} 
                    height={40}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">صنف من</h1>
                </div>
              </div>
                
              {/* City Selector */}
              <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">تهران</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* RIGHT SIDE - Actions & User */}
            <div className="flex items-center gap-3">
              {/* Help */}
              <button className="group relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                <HelpCircle className="w-5 h-5" />
                <div className="absolute top-full left-1/2 z-50 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
                  راهنمای صفحه
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                </div>
              </button>

              {/* Chat with Admin */}
              <div className="pr-3 border-r border-gray-200">
                <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-all duration-200">
                  <div className="relative">
                    <MessageCircle className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <span className="text-sm font-medium">چت با ادمین</span>
                </button>
              </div>   

              {/* User Profile */}
              <Link 
                href="/user"
                className="flex items-center gap-2 pr-3 border-r border-gray-200"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full border-2 border-blue-300 flex items-center justify-center hover:shadow-md transition-all duration-200">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </Link>

              {/* Wholesale Messages */}
              <Link 
                href="/seller/wholesale-announcements"
                onClick={handleWholesaleMessagesClick}
                className="flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 hover:shadow-lg group relative"
              >
                <div className="relative">
                  <MessageCircle className="w-5 h-5" />
                  {!isLoading && unreadMessages > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border-2 border-blue-600 group-hover:border-blue-700 animate-pulse"></div>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">پیام های عمده فروشان</span>
                </div>
                {!isLoading && unreadMessages > 0 && (
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-blue-600 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-200">
                    {unreadMessages}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Navbar */}
      <nav className="lg:hidden w-full bg-white border-b border-gray-200 fixed top-0 z-50" dir="rtl">
        <div className="px-4">
          <div className="h-14 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50">
                <Image 
                  src={logo} 
                  alt="صنف من" 
                  width={32} 
                  height={32}
                  className="rounded-lg"
                />
              </div>
              <h1 className="text-lg font-bold text-gray-900">صنف من</h1>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Notifications/Announcements */}
              <Link 
                href="/seller/wholesale-announcements"
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
                {!isLoading && unreadMessages > 0 && (
                  <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-medium">
                    {unreadMessages}
                  </span>
                )}
              </Link>

              {/* Help */}
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                <HelpCircle className="w-5 h-5" />
              </button>

              {/* User Profile */}
              <Link 
                href="/user"
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* We've removed the mobile slide menu as requested */}

      {/* Mobile Bottom Navbar - Modern Floating Style */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50" dir="rtl">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 px-2 py-2">
          <div className="flex items-center justify-around">
            {/* Search - Navigate to /seller and force refresh */}
            <button 
              onClick={() => {
                // Force navigation to main page by using window.location
                // This ensures all states are reset
                window.location.href = '/seller';
              }}
              className="flex flex-col items-center gap-1 p-3 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded-xl hover:bg-blue-50 active:scale-95"
            >
              <Search className="w-5 h-5" />
              <span className="text-[10px] font-semibold">جستجو</span>
            </button>

            {/* Categories - Use MainPage's handleShowCategories */}
            <button 
              onClick={() => router.push('/seller?showCategories=true')}
              className="flex flex-col items-center gap-1 p-3 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded-xl hover:bg-blue-50 active:scale-95"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-semibold">دسته‌بندی</span>
            </button>

            {/* Chat with Admin */}
            <button className="flex flex-col items-center gap-1 p-3 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded-xl hover:bg-blue-50 active:scale-95 relative">
              <MessageCircle className="w-5 h-5" />
              <span className="text-[10px] font-semibold">ادمین</span>
              <div className="absolute top-2 right-3 w-2 h-2 bg-green-500 rounded-full" />
            </button>

            {/* Profile */}
            <Link 
              href="/user"
              className="flex flex-col items-center gap-1 p-3 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded-xl hover:bg-blue-50 active:scale-95"
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-semibold">حساب</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for mobile top navbar */}
      {/* <div className="lg:hidden " /> */}
      
      {/* Spacer for mobile bottom navbar - extra space for floating nav */}
      <div className="lg:hidden h-12" />
    </>
  );
};

export default SellerNavbar;
