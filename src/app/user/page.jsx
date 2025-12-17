"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, ChevronLeft, Settings, Shield, Bell, HelpCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../assets/fonts/ic_neo.png";
import { useAuth } from "../../hooks/useAuth";

export default function UserPage() {
  const router = useRouter();
  const { getToken } = useAuth('seller');
  const [userName, setUserName] = useState("کاربر");
  const [userRole, setUserRole] = useState("فروشنده");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // This code will only run on the client side
    if (typeof window !== 'undefined') {
      // Get user info from localStorage
      const storedName = localStorage.getItem("user_name") || "کاربر";
      const phone = localStorage.getItem("phone") || "";
      
      setUserName(storedName);
      setIsLoading(false);
      
      // You could fetch more user data from API here
    }
  }, []);
  
  // Show loading state while checking localStorage
  if (isLoading) {
    return <div>Loading...</div>; // or a loading spinner
  }
  
  const handleLogout = () => {
    // Clear all auth tokens
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_id");
    localStorage.removeItem("phone");
    
    // Redirect to login page
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          <Link href="/seller" className="p-2 text-gray-600">
            <ChevronLeft className="text-lg" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 mr-4">حساب کاربری</h1>
        </div>
      </div>
      
      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16"></div>
      
      {/* Desktop Header */}
      <div className="hidden lg:block w-full bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/seller" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">حساب کاربری</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-sm">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 text-xl">{userName}</h2>
              <p className="text-sm text-gray-500">{userRole}</p>
              <p className="text-sm text-gray-500 mt-1">{localStorage.getItem("phone") || ""}</p>
            </div>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="divide-y divide-gray-100">
            <Link href="/user/settings" className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-medium text-gray-800">تنظیمات حساب کاربری</span>
              <ChevronLeft className="w-5 h-5 text-gray-400 mr-auto" />
            </Link>
            
            <Link href="/user/security" className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-medium text-gray-800">امنیت و حریم خصوصی</span>
              <ChevronLeft className="w-5 h-5 text-gray-400 mr-auto" />
            </Link>
            
            <Link href="/user/notifications" className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-medium text-gray-800">اعلان‌ها</span>
              <ChevronLeft className="w-5 h-5 text-gray-400 mr-auto" />
            </Link>
            
            <Link href="/help" className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-medium text-gray-800">راهنما و پشتیبانی</span>
              <ChevronLeft className="w-5 h-5 text-gray-400 mr-auto" />
            </Link>
          </div>
        </div>
        
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          خروج از حساب کاربری
        </button>
      </div>
      
      {/* Spacer for mobile bottom navbar */}
      <div className="lg:hidden h-24"></div>
    </div>
  );
}
