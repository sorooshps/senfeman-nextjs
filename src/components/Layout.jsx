'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { HelpCircle, MessageCircle, User, ChevronDown, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import logo from "../../../assets/fonts/LOGO_SVG.svg";

const Layout = ({ children, pageTitle = "داشبورد" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [publishersOpen, setPublishersOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth(null, { skipRoleRedirect: true });

  const handleLogout = () => {
    logout();
  };

  const isActiveRoute = (href) => {
    if (href === '#') return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const togglePublishers = () => {
    setPublishersOpen(!publishersOpen);
  };

  const navigationItems = [
    {
      name: "داشبورد",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: "/wholesaler/dashboard"
    },
    {
      name: "پیام ها با ادمین",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9m0 3a2 2 0 012-2h2a2 2 0 012 2m0 0v6a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9" />
        </svg>
      ),
      href: "#"
    },
    {
      name: "تابلوی اعلانات",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      href: "/wholesaler/announcements"
    },
    {
      name: "یادداشت های من",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6m-9-11h0M19 18H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z" />
        </svg>
      ),
      href: "/wholesaler/notes"
    },
    {
      name: "حساب کاربری",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: "#"
    },
    {
      name: "تنظیمات",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: "#"
    }
  ];

  const renderNavigationItems = (isMobile = false) => (
    <nav className="flex-1 p-4 space-y-2">
      {navigationItems.map((item, index) => (
        <div key={index}>
          {item.hasDropdown ? (
            <button
              onClick={togglePublishers}
              className="flex items-center justify-between w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
            >
              <div className="flex items-center">
                {item.icon}
                {(sidebarOpen || isMobile) && item.name}
              </div>
              {(sidebarOpen || isMobile) && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transform ${publishersOpen ? 'rotate-0' : 'rotate-180'}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                isActiveRoute(item.href)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => isMobile && setMobileSidebarOpen(false)}
            >
              {item.icon}
              {(sidebarOpen || isMobile) && item.name}
            </Link>
          )}

          {item.hasDropdown && publishersOpen && (sidebarOpen || isMobile) && (
            <div className="mt-2 space-y-1 pr-8">
              <Link href="#" className="block py-2 px-4 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                اطلاعیه اول
              </Link>
              <Link href="#" className="block py-2 px-4 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                اطلاعیه دوم
              </Link>
              <Link href="#" className="block py-2 px-4 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                اطلاعیه سوم
              </Link>
            </div>
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen bg-gray-100" dir='rtl'>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex ${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white flex-col transition-all duration-300`}>
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen ? (
            <>
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center ml-3">
                  <img src={logo.src} alt="صنف من" className="w-8 h-8" />
                </div>
                <span className="text-lg font-bold">صنف من</span>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex justify-center w-full">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {renderNavigationItems()}

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-700 mb-70">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 ml-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {sidebarOpen && "خروج از حساب کاربری"}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 right-0 z-50 lg:hidden h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 ${
        mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center ml-3">
              <img src={logo.src} alt="صنف من" className="w-8 h-8" />
            </div>
            <span className="text-lg font-bold">صنف من</span>
          </div>
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {renderNavigationItems(true)}

        {/* Logout Section for Mobile */}
        <div className="p-4 border-t border-gray-700 mt-auto">
          <button
            onClick={() => {
              handleLogout();
              setMobileSidebarOpen(false);
            }}
            className="flex items-center w-full p-3 rounded-lg text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 ml-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            خروج از حساب کاربری
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="flex justify-between items-center bg-white p-4 shadow-sm border-b border-gray-200">
          {/* Left side - Hamburger menu and logo (visible on mobile) */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ml-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center ml-2">
                <img src={logo.src} alt="صنف من" className="w-6 h-6" />
              </div>
              <span className="text-lg font-bold text-gray-800">صنف من</span>
            </div>
          </div>

          {/* Page title (hidden on mobile, visible on desktop) */}
          <div className="hidden lg:flex items-center">
            <h1 className="text-xl font-semibold text-gray-800 ml-4">{pageTitle}</h1>
          </div>

          {/* Right side - Icons */}
          <div className="flex items-center gap-3">
            {/* Help and Notification (always visible) */}
            <div className="flex items-center gap-2">
              {/* Help Circle - visible on all screens */}
              <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group">
                <HelpCircle className="w-5 h-5" />
                <div className="absolute top-full left-1/2 z-50 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
                  راهنمای صفحه
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                </div>
              </button>

              {/* Notification Icon with Count */}
              <button className="relative flex items-center border border-gray-200 justify-center w-10 h-10 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  ۵
                </span>
              </button>
            </div>

            {/* Desktop-only items */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Chat with Admin */}
              <div className="pl-4 border-l border-gray-200">
                <button className="flex items-center gap-2 px-3 py-2 pl-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-all duration-200 group">
                  <div className="relative">
                    <MessageCircle className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-medium">چت با ادمین</span>
                </button>
              </div>

              {/* Today's Date with Calendar Icon */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm text-gray-700">دوشنبه ۲۵ بهمن</span>
              </div>

              {/* User Profile Picture */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src="https://via.placeholder.com/150"
                  alt="User Avatar"
                />
              </div>
            </div>

            {/* Mobile-only user avatar */}
            <div className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center">
              <img
                className="w-8 h-8 rounded-full object-cover"
                src="https://via.placeholder.com/150"
                alt="User Avatar"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;