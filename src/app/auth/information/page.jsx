"use client";

import React, { useState ,useEffect } from "react";
import { FaChevronRight, FaPlus, FaCheck } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestRole, refreshToken } from "../../../api";

export default function InformationPage() {
  const cities = [
    { id: 1, name: "تهران" },
    { id: 2, name: "اصفهان" },
    { id: 3, name: "شیراز" },
    { id: 4, name: "مشهد" },
    { id: 5, name: "کرج" },
    // Add more cities as needed
  ];

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    phone2: "",
    operate: "s",
    address: "",
    city: 1
  });
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState("");
  const [role, setRole] = useState("wholesaler");
  const router = useRouter();

  // Load data from localStorage after component mounts
  useEffect(() => {
    const phone = typeof window !== 'undefined' ? localStorage.getItem("phone") : "";
    const userRole = typeof window !== 'undefined' ? localStorage.getItem("selectedRole") : "wholesaler";
    
    setFormData(prev => ({
      ...prev,
      phone: phone || ""
    }));
    setRole(userRole || "wholesaler");
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    let access = localStorage.getItem("access");
    if (!access) {
      router.push("/auth/login");
      return;
    }
    const requestData = {
      role: role,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      ...(formData.phone2 && { phone2: formData.phone2 }),
      operate: formData.operate,
      address: formData.address,
      city: parseInt(formData.city)
    };
    console.log('Request data:', requestData);
    try {
      const response = await requestRole(requestData, access);
      console.log('Response:', response);
      router.push("/auth/role-status");
    } catch (err) {
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        // Try to refresh token
        const refresh = localStorage.getItem("refresh");
        if (refresh) {
          try {
            const refreshData = await refreshToken(refresh);
            localStorage.setItem("access", refreshData.access || refreshData.access_token);
            localStorage.setItem("refresh", refreshData.refresh || refreshData.refresh_token);
            access = refreshData.access || refreshData.access_token;
            // Retry with new token
            const retryResponse = await requestRole({
              role: role,
              first_name: formData.first_name,
              last_name: formData.last_name,
              phone: formData.phone,
              ...(formData.phone2 && { phone2: formData.phone2 }),
              operate: formData.operate,
              address: formData.address,
              city: parseInt(formData.city)
            }, access);
            console.log('Retry response:', retryResponse);
            router.push("/auth/role-status");
          } catch (refreshErr) {
            setError("خطا در احراز هویت، لطفا دوباره وارد شوید");
            router.push("/auth/login");
          }
        } else {
          setError("خطا در احراز هویت، لطفا دوباره وارد شوید");
          router.push("/auth/login");
        }
      } else {
        setError("خطا در ارسال درخواست نقش");
      }
    }
    setLoading(false);
  };
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 lg:bg-gradient-to-br lg:from-blue-50 lg:to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/auth/choose-role" className="p-2 text-gray-600">
            <FaChevronRight className="text-lg" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">اطلاعات کاربری</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden bg-white min-h-screen pt-4">
        <div className="px-4 pb-20">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">نام</label>
              <input
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                placeholder="نام خود را وارد نمایید"
                className="w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">نام خانوادگی</label>
              <input
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                placeholder="نام خانوادگی خود را وارد نمایید"
                className="w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">شماره تماس / شناسه ملی</label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="شماره تماس یا شناسه ملی خود را وارد نمایید (مثال: 09123456789)"
                className="w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200"
              />
              <input
                value={formData.phone2}
                onChange={(e) => setFormData({...formData, phone2: e.target.value})}
                placeholder="شماره تماس دوم (اختیاری)"
                className="w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">نحوه فعالیت</label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, operate: 's'})}
                  className={`w-full border-2 rounded-xl p-4 text-sm flex items-center gap-4 justify-between ${formData.operate === 's' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex items-center gap-4">
                    {formData.operate === 's' && (
                      <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-blue-50">
                        <FaCheck className="text-blue-500 text-xs" />
                      </div>
                    )}
                    {formData.operate !== 's' && (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white" />
                    )}
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">فردی هستم / مالک/مالکیت شخصی</div>
                      <div className="text-xs text-gray-600 mt-1">به صورت حقیقی فعالیت می‌کنم.</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({...formData, operate: 't'})}
                  className={`w-full border-2 rounded-xl p-4 text-sm flex items-center gap-4 justify-between ${formData.operate === 't' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex items-center gap-4">
                    {formData.operate === 't' && (
                      <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-blue-50">
                        <FaCheck className="text-blue-500 text-xs" />
                      </div>
                    )}
                    {formData.operate !== 't' && (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white" />
                    )}
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">به صورت شرکت/سازمان فعالیت می‌کنم</div>
                      <div className="text-xs text-gray-600 mt-1">برای کسب و کار سازمانی</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">آدرس محل کار</label>
              <input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="آدرس محل کار خود را وارد نمایید"
                className="w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">شهر فعالیت</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: parseInt(e.target.value)})}
                className="w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200"
              >
                <option value={0}>شهر خود را انتخاب کنید</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Navigation Buttons */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-white text-base font-medium transition-all text-center disabled:opacity-50"
              >
                {loading ? "در حال ارسال..." : "ادامه"}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex flex-1 w-full items-center justify-center py-12 px-4">
        <div className="w-full max-w-[741px]">
          <div className="mx-auto max-w-2x">
            <div className="bg-white rounded-[16px] shadow-xl border border-gray-200/60 p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <Link href="/auth/choose-role" className="p-3 rounded-2xl hover:bg-gray-50 transition-all duration-200 hover:shadow-sm border border-transparent hover:border-gray-200">
                  <FaChevronRight className="text-gray-400 text-lg" />
                </Link>
                <div className="text-center flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    اطلاعات کاربری
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">اطلاعات کاربری خود را وارد نمایید</p>
                </div>
              </div>

              <div className="border-t border-gray-200/60 my-6" />

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
                  <input
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    placeholder="نام خود را وارد نمایید"
                    className="w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
                  <input
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    placeholder="نام خانوادگی خود را وارد نمایید"
                    className="w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Contact Field */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">شماره تماس / شناسه ملی</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="شماره تماس یا شناسه ملی خود را وارد نمایید (مثال: 09123456789)"
                    className="w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                  <input
                    value={formData.phone2}
                    onChange={(e) => setFormData({...formData, phone2: e.target.value})}
                    placeholder="شماره تماس دوم (اختیاری)"
                    className="w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Activity Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">نحوه فعالیت</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, operate: 's'})}
                      className={`border-2 rounded-xl p-4 text-sm flex items-center gap-4 justify-between hover:shadow-md transition-all duration-200 group ${formData.operate === 's' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="flex items-center gap-4">
                        {formData.operate === 's' && (
                          <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-blue-50">
                            <FaCheck className="text-blue-500 text-xs" />
                          </div>
                        )}
                        {formData.operate !== 's' && (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white" />
                        )}
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">فردی هستم / مالک/مالکیت شخصی</div>
                          <div className="text-xs text-gray-600 mt-1">به صورت حقیقی فعالیت می‌کنم.</div>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({...formData, operate: 't'})}
                      className={`border-2 rounded-xl p-4 text-sm flex items-center gap-4 justify-between hover:shadow-md transition-all duration-200 group ${formData.operate === 't' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="flex items-center gap-4">
                        {formData.operate === 't' && (
                          <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-blue-50">
                            <FaCheck className="text-blue-500 text-xs" />
                          </div>
                        )}
                        {formData.operate !== 't' && (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white" />
                        )}
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">به صورت شرکت/سازمان فعالیت می‌کنم</div>
                          <div className="text-xs text-gray-600 mt-1">برای کسب و کار سازمانی</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Address Field */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">آدرس محل کار</label>
                  <input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="آدرس محل کار خود را وارد نمایید"
                    className="w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* City Field */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">شهر فعالیت</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 rounded-xl py-4 px-4 text-sm placeholder-gray-500 border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all duration-200"
                  >
                    <option value={0}>شهر خود را انتخاب کنید</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FaCheck className="text-white" />
                    {loading ? "در حال ارسال..." : "تایید"}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
              </form>
            </div>

            <div className="mt-8 text-center">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}