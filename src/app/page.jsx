"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has a token
    const access = localStorage.getItem("access");
    if (access) {
      // User is already logged in, redirect to role-status
      router.push("/auth/role-status");
    }
  }, [router]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center" dir="rtl">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">صنف من</h1>
            <p className="text-gray-600">پلتفرم ارتباطی کسبه و عمده فروشان</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              ورود به حساب کاربری
            </button>

            <div className="text-sm text-gray-500">
              <p>برای استفاده از امکانات پلتفرم وارد حساب خود شوید</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">۱۰۰۰+</div>
                <div className="text-gray-600">فروشنده</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">۵۰۰۰+</div>
                <div className="text-gray-600">محصول</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
