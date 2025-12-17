"use client";

import React from "react";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChooseRolePage() {
  const router = useRouter();

  const handleRoleSelect = (role) => {
    localStorage.setItem('selectedRole', role);
    router.push('/auth/information');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/auth/login" className="p-2 text-gray-600">
            <FaChevronLeft className="text-lg" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">تعیین سمت</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden bg-white flex-1 px-4 py-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">تعیین سمت</h2>
            <p className="text-sm text-gray-600 mt-2">
              لطفاً نقش خود را مشخص کنید تا مراحل بعدی به درستی طی شود
            </p>
          </div>

          {/* Role Selection Buttons */}
          <div className="space-y-4">
            {/* Bankdar Button */}
             <button
               onClick={() => handleRoleSelect('wholesaler')}
               className="w-full border-2 border-gray-200 bg-white rounded-xl p-4 text-right flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
             >
              <div className="flex items-center gap-3">
                <FaChevronLeft className="text-gray-400 text-sm group-hover:text-blue-500 transition-colors" />
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">بنک دار</div>
                  <div className="text-xs text-gray-600 mt-1 text-right">
                    کسانی که تامین کننده اصلی کالا هستند و به صورت عمده کالا را برای کاسبان و فروشنده ها تامین می‌کنند
                  </div>
                </div>
              </div>
            </button>

            {/* Kasb Button */}
            <button
              onClick={() => handleRoleSelect('seller')}
              className="w-full border-2 border-gray-200 bg-white rounded-xl p-4 text-right flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <FaChevronLeft className="text-gray-400 text-sm group-hover:text-blue-500 transition-colors" />
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">کاسب (خرده فروش)</div>
                  <div className="text-xs text-gray-600 mt-1 text-right">
                    کسانی که کالا را به مشتری و مصرف کننده نهایی می فروشند
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Mobile Continue Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <button
              onClick={() => handleRoleSelect('wholesaler')} // default
              className="w-full py-4 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all text-center"
            >
              ادامه
            </button>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex lg:bg-gradient-to-br lg:from-blue-50 lg:to-gray-100 flex-1 items-center justify-center py-12">
        <div className="w-full max-w-[500px] mx-4">
          <div className="bg-white rounded-[12px] shadow-xl border border-gray-200/60 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/auth/login" className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200">
                <FaChevronRight className="text-gray-900 text-lg" />
              </Link>
              <div className="text-center flex-1">
                <h2 className="text-xl font-bold text-gray-900">تعیین سمت</h2>
                <p className="text-sm text-gray-500 mt-2">
                  لطفاً نقش خود را مشخص کنید تا مراحل بعدی به درستی طی شود
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200/60 my-6" />

            {/* Role Selection Buttons */}
            <div className="space-y-4">
              {/* Bankdar Button */}
              <Link
                href="/auth/information"
                className="w-full border-2 border-gray-200 bg-white rounded-xl p-6 text-right flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all duration-200 group block"
              >
                <div className="flex items-center gap-4">
                  <FaChevronLeft className="text-gray-400 text-lg group-hover:text-blue-500 transition-colors" />
                  <div className="text-right">
                    <div className="text-base font-semibold text-gray-900">بنک دار</div>
                    <div className="text-sm text-gray-600 mt-2 text-right">
                      کسانی که تامین کننده اصلی کالا هستند و به صورت عمده کالا را برای کاسبان و فروشنده ها تامین می‌کنند
                    </div>
                  </div>
                </div>
              </Link>

              {/* Kasb Button */}
              <Link
                href="/auth/information"
                className="w-full border-2 border-gray-200 bg-white rounded-xl p-4 text-right flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all duration-200 group block"
              >
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-base font-semibold text-gray-900">کاسب (خرده فروش)</div>
                    <div className="text-sm text-gray-600 mt-2 text-right">
                      کسانی که کالا را به مشتری و مصرف کننده نهایی می فروشند
                    </div>
                  </div>
                  <FaChevronLeft className="text-gray-400 text-lg group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            </div>

            {/* Desktop Continue Button */}
            <div className="pt-6">
              <button
                onClick={() => handleRoleSelect('wholesaler')} // default
                className="w-full py-4 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                ادامه
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}