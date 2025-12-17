"use client";

import React, { useState, useEffect } from "react";
import { FaChevronRight, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";

export default function RoleStatusPage() {
   const { roleStatus, userRole, loading, error, checkRoleStatus } = useAuth(null, { skipRoleRedirect: true });
   const router = useRouter();

   console.log('[ROLE STATUS] Current state - status:', roleStatus, 'role:', userRole, 'loading:', loading, 'error:', error);

   if (loading) {
     console.log('[ROLE STATUS] Loading...');
     return (
       <div dir="rtl" className="min-h-screen bg-gray-50 flex flex-col font-custom">
         <div className="flex-1 flex items-center justify-center">
           <FaSpinner className="text-blue-500 text-4xl animate-spin" />
         </div>
       </div>
     );
   }

   if (error) {
     console.error('[ROLE STATUS] Error:', error);
     // If error, redirect to login
     router.push("/auth/login");
     return null;
   }

   const status = roleStatus;
   const role = userRole;

   console.log('[ROLE STATUS] Final status:', status, 'role:', role);

  const getStatusMessage = () => {
    switch (status) {
      case "pending":
        return "درخواست شما در حال بررسی توسط ادمین است. لطفا صبر کنید.";
      case "accepted":
        return "درخواست شما تایید شد.";
      case "rejected":
        return "درخواست شما رد شد. لطفا با پشتیبانی تماس بگیرید.";
      case "not_requested":
        return "شما هنوز نقشی درخواست نکرده‌اید. لطفا ابتدا نقش خود را انتخاب کنید.";
      case "error":
        return "خطا در دریافت وضعیت. لطفا دوباره تلاش کنید.";
      default:
        return "در حال بارگذاری...";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <FaSpinner className="text-yellow-500 text-4xl animate-spin" />;
      case "accepted":
        return <FaCheck className="text-green-500 text-4xl" />;
      case "rejected":
        return <FaTimes className="text-red-500 text-4xl" />;
      case "not_requested":
        return <FaTimes className="text-gray-500 text-4xl" />;
      case "error":
        return <FaTimes className="text-red-500 text-4xl" />;
      default:
        return <FaSpinner className="text-blue-500 text-4xl animate-spin" />;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex flex-col font-custom">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center">
          <button onClick={() => router.push("/auth/login")} className="p-2 text-gray-600">
            <FaChevronRight className="text-lg" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 mr-4">وضعیت درخواست نقش</h1>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden bg-white flex-1 px-4 py-6">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">وضعیت درخواست نقش</h2>
            <p className="text-sm text-gray-600">{getStatusMessage()}</p>
          </div>
          {status === "accepted" && (
            
            <button
              onClick={() => {
                if (role === "wholesaler") {
                  router.push("/wholesaler/dashboard");
                } else if (role === "seller") {
                  router.push("/seller");
                }
              }}
              className="w-full py-4 rounded-xl bg-linear-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              ورود به داشبورد
            </button>
          )}
          {status === "not_requested" && (
            <button
              onClick={() => router.push("/auth/choose-role")}
              className="w-full py-4 rounded-xl bg-linear-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              انتخاب نقش
            </button>
          )}
          {status === "rejected" && (
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full py-4 rounded-xl bg-linear-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              بازگشت به ورود
            </button>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex lg:bg-linear-to-br lg:from-blue-50 lg:to-gray-100 flex-1 items-center justify-center py-12">
        <div className="w-full max-w-[450px] mx-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200/60 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => router.push("/auth/login")} className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200">
                <FaChevronRight className="text-gray-900 text-lg" />
              </button>
              <div className="text-center flex-1">
                <h2 className="text-xl font-bold text-gray-900">وضعیت درخواست نقش</h2>
              </div>
            </div>

            <div className="border-t border-gray-200/60 my-4" />

            <div className="text-center space-y-4">
              <div className="flex justify-center">{getStatusIcon()}</div>
              <p className="text-base text-gray-700">{getStatusMessage()}</p>
              {status === "accepted" && (
                <button
                  onClick={() => {
                    if (role === "wholesaler") {
                      router.push("/wholesaler/dashboard");
                    } else if (role === "seller") {
                      router.push("/seller");
                    }
                  }}
                  className="w-full py-4 rounded-xl bg-linear-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  ورود به داشبورد
                </button>
              )}
              {status === "not_requested" && (
                <button
                  onClick={() => router.push("/auth/choose-role")}
                  className="w-full py-4 rounded-xl bg-linear-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  انتخاب نقش
                </button>
              )}
              {status === "rejected" && (
                <button
                  onClick={() => router.push("/auth/login")}
                  className="w-full py-4 rounded-xl bg-linear-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  بازگشت به ورود
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}