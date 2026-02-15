"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Package,
  Truck,
  X
} from "lucide-react";
import { RiMotorbikeFill } from "react-icons/ri";
import { GiCartwheel } from "react-icons/gi";
import { MdElevator } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../assets/fonts/LOGO_SVG.svg";
import { getAnnouncementUnreadCount } from "../../../api/seller";
import { useAuth } from "../../../hooks/useAuth";

const SellerNavbar = () => {
  const router = useRouter();
  const { getToken } = useAuth('seller', { skipRoleRedirect: true });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const modalRef = useRef(null);

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
    
    const interval = setInterval(fetchUnreadCounts, 30000);
    return () => clearInterval(interval);
  }, [getToken]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsServicesOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        // Don't close mobile services here - handled separately
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key to close mobile services
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isMobileServicesOpen) {
        setIsMobileServicesOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isMobileServicesOpen]);

  // Handle navigation
  const handleWholesaleMessagesClick = (e) => {
    e.preventDefault();
    router.push('/seller/wholesale-announcements');
  };

  // Service items
  const serviceItems = [
    {
      id: 'motorcycle',
      name: 'پیک موتور',
      icon: <RiMotorbikeFill className="w-5 h-5 text-blue-600" />,
      href: '/seller/peyk-motors',
      color: 'blue',
      shortName: 'پیک'
    },
    {
      id: 'van',
      name: 'وانت',
      icon: <Truck className="w-5 h-5 text-green-600" />,
      href: '/seller/vanet',
      color: 'green',
      shortName: 'وانت'
    },
    {
      id: 'cart',
      name: 'چرخی',
      icon: <GiCartwheel className="w-5 h-5 text-orange-600" />,
      href: '/seller/charkhi',
      color: 'orange',
      shortName: 'چرخی'
    },
    {
      id: 'lift',
      name: 'بالابر',
      icon: <MdElevator className="w-5 h-5 text-purple-600" />,
      href: '/seller/balabar',
      color: 'purple',
      shortName: 'بالابر'
    }
  ];

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

              {/* Services Dropdown - Desktop */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isServicesOpen 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span className="text-sm font-medium">خدمات</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu - Desktop */}
                {isServicesOpen && (
                  <div 
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                    className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {/* Dropdown Header */}
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">خدمات حمل و نقل</h3>
                          <p className="text-xs text-gray-500 mt-1">انتخاب بهترین سرویس برای نیاز شما</p>
                        </div>
                      </div>
                    </div>

                    {/* Services Grid */}
                    <div className="p-2">
                      {serviceItems.map((service) => (
                        <Link
                          key={service.id}
                          href={service.href}
                          onClick={() => setIsServicesOpen(false)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group block"
                        >
                          <div className={`p-2 rounded-lg bg-${service.color}-50 group-hover:scale-110 transition-transform duration-200`}>
                            {service.icon}
                          </div>
                          <div className="flex-1 text-right">
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">سرویس {service.shortName} برای حمل بار</p>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors rotate-270" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
              {/* Services Dropdown for Mobile - Top Nav */}
              <div className="relative" ref={mobileDropdownRef}>
                <button
                  onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                  className={`p-2 rounded-lg transition-all duration-200 relative ${
                    isMobileServicesOpen 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  {/* Badge for services availability */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                </button>
              </div>

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

      {/* Mobile Services Modal */}
      {isMobileServicesOpen && (
        <div className="lg:hidden">
          {/* Overlay - Only closes modal when clicked */}
          <div 
            className="fixed inset-0 bg-black/30 z-40 animate-in fade-in duration-200"
            onClick={() => setIsMobileServicesOpen(false)}
          />
           
          {/* Modal - Wrapped in a div that stops propagation */}
          <div 
            ref={modalRef}
            className="fixed inset-x-4 top-20 z-50 animate-in slide-in-from-top-2 duration-200"
            onClick={(e) => {
              // Stop click from bubbling to overlay
              e.stopPropagation();
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">خدمات</h3>
                    <p className="text-xs text-gray-500">انتخاب سرویس</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileServicesOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Services Grid */}
              <div className="p-3">
                <div className="grid grid-cols-2 gap-2">
                  {serviceItems.map((service) => (
                    <Link
                      key={service.id}
                      href={service.href}
                      onClick={() => setIsMobileServicesOpen(false)}
                      className="w-full flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      <div className={`p-3 rounded-full mb-2 ${
                        service.color === 'blue' ? 'bg-blue-50' :
                        service.color === 'green' ? 'bg-green-50' :
                        service.color === 'orange' ? 'bg-orange-50' :
                        'bg-purple-50'
                      }`}>
                        <div className="scale-125">
                          {service.icon}
                        </div>
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{service.shortName}</span>
                      <span className="text-xs text-gray-500 mt-0.5">{service.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Info */}
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-600 text-center">
                  برای اطلاعات بیشتر تماس بگیرید
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navbar */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-30" dir="rtl">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 px-2 py-2">
          <div className="flex items-center justify-around">
            {/* Search */}
            <Link 
              href="/seller"
              className="flex flex-col items-center gap-1 p-3 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded-xl hover:bg-blue-50 active:scale-95"
            >
              <Search className="w-5 h-5" />
              <span className="text-[10px] font-semibold">جستجو</span>
            </Link>

            {/* Categories */}
            <Link 
              href="/seller/categories"
              className="flex flex-col items-center gap-1 p-3 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded-xl hover:bg-blue-50 active:scale-95"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-semibold">دسته‌بندی</span>
            </Link>

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

      {/* Spacer for mobile bottom navbar */}
      <div className="lg:hidden h-12" />
    </>
  );
};

export default SellerNavbar;



// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import {
//   User,
//   Bell,
//   MessageCircle,
//   MapPin,
//   ChevronDown,
//   HelpCircle,
//   Search,
//   Menu,
//   Package,
//   Truck,
//   X
// } from "lucide-react";
// import { RiMotorbikeFill } from "react-icons/ri";
// import { GiCartwheel } from "react-icons/gi";
// import { MdElevator } from "react-icons/md";
// import Image from "next/image";
// import Link from "next/link";
// import logo from "../../../assets/fonts/LOGO_SVG.svg";
// import { getAnnouncementUnreadCount } from "../../../api/seller";
// import { useAuth } from "../../../hooks/useAuth";

// const SellerNavbar = () => {
//   const router = useRouter();
//   const { getToken } = useAuth('seller', { skipRoleRedirect: true });
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isServicesOpen, setIsServicesOpen] = useState(false);
//   const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
//   const [unreadMessages, setUnreadMessages] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);
  
//   const dropdownRef = useRef(null);
//   const mobileDropdownRef = useRef(null);

//   // Fetch unread messages count
//   useEffect(() => {
//     const fetchUnreadCounts = async () => {
//       const token = getToken();
//       if (!token) return;

//       try {
//         setIsLoading(true);
//         const res = await getAnnouncementUnreadCount(token);
//         setUnreadMessages(res?.unread_count || 0);
//       } catch (error) {
//         console.error('Error fetching unread messages:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchUnreadCounts();
    
//     const interval = setInterval(fetchUnreadCounts, 30000);
//     return () => clearInterval(interval);
//   }, [getToken]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsServicesOpen(false);
//       }
//       if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
//         setIsMobileServicesOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Handle navigation
//   const handleWholesaleMessagesClick = (e) => {
//     e.preventDefault();
//     router.push('/seller/wholesale-announcements');
//   };

//   // Service items
//   const serviceItems = [
//     {
//       id: 'motorcycle',
//       name: 'پیک موتور',
//       icon: <RiMotorbikeFill className="w-5 h-5 text-blue-600" />,
//       href: '/seller/peyk-motors',
//       color: 'blue',
//       shortName: 'پیک'
//     },
//     {
//       id: 'van',
//       name: 'وانت',
//       icon: <Truck className="w-5 h-5 text-green-600" />,
//       href: '/seller/vanet',
//       color: 'green',
//       shortName: 'وانت'
//     },
//     {
//       id: 'cart',
//       name: 'چرخی',
//       icon: <GiCartwheel className="w-5 h-5 text-orange-600" />,
//       href: '/seller/charkhi',
//       color: 'orange',
//       shortName: 'چرخی'
//     },
//     {
//       id: 'lift',
//       name: 'بالابر',
//       icon: <MdElevator className="w-5 h-5 text-purple-600" />,
//       href: '/seller/balabar',
//       color: 'purple',
//       shortName: 'بالابر'
//     }
//   ];

//   return (
//     <>
//       {/* Desktop Navbar */}
//       <nav className="hidden lg:block w-full bg-white border-b border-gray-200" dir="rtl">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="h-16 flex items-center justify-between">
            
//             {/* LEFT SIDE - Logo & Navigation */}
//             <div className="flex items-center gap-8">
//               {/* Brand */}
//               <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
//                 <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50">
//                   <Image 
//                     src={logo} 
//                     alt="صنف من" 
//                     width={40} 
//                     height={40}
//                     className="rounded-lg"
//                   />
//                 </div>
//                 <div>
//                   <h1 className="text-xl font-bold text-gray-900">صنف من</h1>
//                 </div>
//               </div>
                
//               {/* City Selector */}
//               <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200">
//                 <MapPin className="w-4 h-4 text-blue-600" />
//                 <span className="text-sm font-medium">تهران</span>
//                 <ChevronDown className="w-4 h-4 text-gray-400" />
//               </button>

//               {/* Services Dropdown - Desktop */}
//               <div className="relative" ref={dropdownRef}>
//                 <button
//                   onMouseEnter={() => setIsServicesOpen(true)}
//                   onMouseLeave={() => setIsServicesOpen(false)}
//                   onClick={() => setIsServicesOpen(!isServicesOpen)}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
//                     isServicesOpen 
//                       ? 'bg-blue-50 text-blue-700 border border-blue-200' 
//                       : 'text-gray-700 hover:bg-gray-50 border border-transparent'
//                   }`}
//                 >
//                   <Package className="w-5 h-5" />
//                   <span className="text-sm font-medium">خدمات</span>
//                   <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
//                 </button>

//                 {/* Dropdown Menu - Desktop */}
//                 {isServicesOpen && (
//                   <div 
//                     onMouseEnter={() => setIsServicesOpen(true)}
//                     onMouseLeave={() => setIsServicesOpen(false)}
//                     className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
//                   >
//                     {/* Dropdown Header */}
//                     <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 bg-blue-100 rounded-lg">
//                           <Package className="w-5 h-5 text-blue-600" />
//                         </div>
//                         <div>
//                           <h3 className="font-bold text-gray-900">خدمات حمل و نقل</h3>
//                           <p className="text-xs text-gray-500 mt-1">انتخاب بهترین سرویس برای نیاز شما</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Services Grid */}
//                     <div className="p-2">
//                       {serviceItems.map((service) => (
//                         <Link
//                           key={service.id}
//                           href={service.href}
//                           onClick={() => setIsServicesOpen(false)}
//                           className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group block"
//                         >
//                           <div className={`p-2 rounded-lg bg-${service.color}-50 group-hover:scale-110 transition-transform duration-200`}>
//                             {service.icon}
//                           </div>
//                           <div className="flex-1 text-right">
//                             <h4 className="font-medium text-gray-900">{service.name}</h4>
//                             <p className="text-xs text-gray-500 mt-1">سرویس {service.shortName} برای حمل بار</p>
//                           </div>
//                           <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors rotate-270" />
//                         </Link>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* RIGHT SIDE - Actions & User */}
//             <div className="flex items-center gap-3">
//               {/* Help */}
//               <button className="group relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
//                 <HelpCircle className="w-5 h-5" />
//                 <div className="absolute top-full left-1/2 z-50 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
//                   راهنمای صفحه
//                   <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
//                 </div>
//               </button>

//               {/* Chat with Admin */}
//               <div className="pr-3 border-r border-gray-200">
//                 <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-all duration-200">
//                   <div className="relative">
//                     <MessageCircle className="w-5 h-5" />
//                     <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
//                   </div>
//                   <span className="text-sm font-medium">چت با ادمین</span>
//                 </button>
//               </div>   

//               {/* User Profile */}
//               <Link 
//                 href="/user"
//                 className="flex items-center gap-2 pr-3 border-r border-gray-200"
//               >
//                 <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full border-2 border-blue-300 flex items-center justify-center hover:shadow-md transition-all duration-200">
//                   <User className="w-5 h-5 text-blue-600" />
//                 </div>
//               </Link>

//               {/* Wholesale Messages */}
//               <Link 
//                 href="/seller/wholesale-announcements"
//                 onClick={handleWholesaleMessagesClick}
//                 className="flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 hover:shadow-lg group relative"
//               >
//                 <div className="relative">
//                   <MessageCircle className="w-5 h-5" />
//                   {!isLoading && unreadMessages > 0 && (
//                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border-2 border-blue-600 group-hover:border-blue-700 animate-pulse"></div>
//                   )}
//                 </div>
//                 <div className="flex flex-col items-start">
//                   <span className="text-sm font-semibold">پیام های عمده فروشان</span>
//                 </div>
//                 {!isLoading && unreadMessages > 0 && (
//                   <div className="w-6 h-6 bg-blue-500 group-hover:bg-blue-600 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-200">
//                     {unreadMessages}
//                   </div>
//                 )}
//               </Link>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Top Navbar */}
//       <nav className="lg:hidden w-full bg-white border-b border-gray-200 fixed top-0 z-50" dir="rtl">
//         <div className="px-4">
//           <div className="h-14 flex items-center justify-between">
//             {/* Logo */}
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50">
//                 <Image 
//                   src={logo} 
//                   alt="صنف من" 
//                   width={32} 
//                   height={32}
//                   className="rounded-lg"
//                 />
//               </div>
//               <h1 className="text-lg font-bold text-gray-900">صنف من</h1>
//             </div>

//             {/* Right Actions */}
//             <div className="flex items-center gap-1">
//               {/* Services Dropdown for Mobile - Top Nav */}
//               <div className="relative" ref={mobileDropdownRef}>
//                 <button
//                   onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
//                   className={`p-2 rounded-lg transition-all duration-200 relative ${
//                     isMobileServicesOpen 
//                       ? 'bg-blue-50 text-blue-600' 
//                       : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
//                   }`}
//                 >
//                   <Package className="w-5 h-5" />
//                   {/* Badge for services availability */}
//                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
//                 </button>
//               </div>

//               {/* Notifications/Announcements */}
//               <Link 
//                 href="/seller/wholesale-announcements"
//                 className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
//               >
//                 <Bell className="w-5 h-5" />
//                 {!isLoading && unreadMessages > 0 && (
//                   <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-medium">
//                     {unreadMessages}
//                   </span>
//                 )}
//               </Link>

//               {/* Help */}
//               <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
//                 <HelpCircle className="w-5 h-5" />
//               </button>

//               {/* User Profile */}
//               <Link 
//                 href="/user"
//                 className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
//               >
//                 <User className="w-5 h-5" />
//               </Link>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Services Modal */}
//       {isMobileServicesOpen && (
//         <>
//           {/* Overlay */}
//           <div 
//             className="lg:hidden fixed inset-0 bg-black/30 z-40 animate-in fade-in duration-200"
//             onClick={() => setIsMobileServicesOpen(false)}
//           />
          
//           {/* Modal */}
//           <div className="lg:hidden fixed inset-x-4 top-20 z-50 animate-in slide-in-from-top-2 duration-200">
//             <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
//               {/* Modal Header */}
//               <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
//                 <div className="flex items-center gap-2">
//                   <div className="p-2 bg-blue-50 rounded-lg">
//                     <Package className="w-5 h-5 text-blue-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-bold text-gray-900 text-sm">خدمات</h3>
//                     <p className="text-xs text-gray-500">انتخاب سرویس</p>
//                   </div>
//                 </div>
//                 <button 
//                   onClick={() => setIsMobileServicesOpen(false)}
//                   className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
//                 >
//                   <X className="w-5 h-5 text-gray-500" />
//                 </button>
//               </div>

//               {/* Services Grid */}
//               <div className="p-3">
//                 <div className="grid grid-cols-2 gap-2">
//                   {serviceItems.map((service) => (
//                     <Link
//                       key={service.id}
//                       href={service.href}
//                       onClick={() => setIsMobileServicesOpen(false)}
//                       className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 active:scale-95"
//                     >
//                       <div className={`p-3 rounded-full mb-2 ${
//                         service.color === 'blue' ? 'bg-blue-50' :
//                         service.color === 'green' ? 'bg-green-50' :
//                         service.color === 'orange' ? 'bg-orange-50' :
//                         'bg-purple-50'
//                       }`}>
//                         <div className="scale-125">
//                           {service.icon}
//                         </div>
//                       </div>
//                       <span className="font-medium text-gray-900 text-sm">{service.shortName}</span>
//                       <span className="text-xs text-gray-500 mt-0.5">{service.name}</span>
//                     </Link>
//                   ))}
//                 </div>
//               </div>

//               {/* Quick Info */}
//               <div className="p-3 bg-gray-50 border-t border-gray-100">
//                 <p className="text-xs text-gray-600 text-center">
//                   برای اطلاعات بیشتر تماس بگیرید
//                 </p>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Mobile Bottom Navbar */}
//       <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-30" dir="rtl">
//         <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 px-2 py-2">
//           <div className="flex items-center justify-around">
//             {/* Search */}
//             <Link 
//               href="/seller"
//               className="flex flex-col items-center gap-1 p-3 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded-xl hover:bg-blue-50 active:scale-95"
//             >
//               <Search className="w-5 h-5" />
//               <span className="text-[10px] font-semibold">جستجو</span>
//             </Link>

//             {/* Categories */}
//             <Link 
//               href="/seller?showCategories=true"
//               className="flex flex-col items-center gap-1 p-3 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded-xl hover:bg-blue-50 active:scale-95"
//             >
//               <Menu className="w-5 h-5" />
//               <span className="text-[10px] font-semibold">دسته‌بندی</span>
//             </Link>

//             {/* Chat with Admin */}
//             <button className="flex flex-col items-center gap-1 p-3 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded-xl hover:bg-blue-50 active:scale-95 relative">
//               <MessageCircle className="w-5 h-5" />
//               <span className="text-[10px] font-semibold">ادمین</span>
//               <div className="absolute top-2 right-3 w-2 h-2 bg-green-500 rounded-full" />
//             </button>

//             {/* Profile */}
//             <Link 
//               href="/user"
//               className="flex flex-col items-center gap-1 p-3 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded-xl hover:bg-blue-50 active:scale-95"
//             >
//               <User className="w-5 h-5" />
//               <span className="text-[10px] font-semibold">حساب</span>
//             </Link>
//           </div>
//         </div>
//       </nav>

//       {/* Spacer for mobile bottom navbar */}
//       <div className="lg:hidden h-12" />
//     </>
//   );
// };

// export default SellerNavbar;