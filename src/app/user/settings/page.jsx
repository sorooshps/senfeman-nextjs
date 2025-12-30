"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { getUserRoleStatus, updateUserProfile } from "../../../api/user";

export default function UserSettingsPage() {
  const router = useRouter();
  const { getToken } = useAuth('seller', { skipRoleRedirect: true });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    phone2: "",
    address: "",
    city: "",
  });
  
  const [originalData, setOriginalData] = useState({});
  const [operateType, setOperateType] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await getUserRoleStatus(token);
      
      if (response.status === 'accepted' && response.data) {
        const data = response.data;
        const profileData = {
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          phone2: data.phone2 || "",
          address: data.address || "",
          city: data.city || "",
        };
        
        setFormData(profileData);
        setOriginalData(profileData);
        setOperateType(data.operate || "");
        setRole(data.role || "");
      } else if (response.status === 'pending') {
        setError("درخواست شما در حال بررسی است");
      } else if (response.status === 'rejected') {
        setError("درخواست شما رد شده است");
      } else {
        setError("لطفا ابتدا درخواست نقش خود را ثبت کنید");
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError("خطا در بارگذاری اطلاعات پروفایل");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if any field has changed
    const hasChanges = Object.keys(formData).some(
      key => formData[key] !== originalData[key]
    );
    
    if (!hasChanges) {
      setError("هیچ تغییری ایجاد نشده است");
      return;
    }
    
    // Validate required fields
    if (!formData.first_name.trim()) {
      setError("نام الزامی است");
      return;
    }
    if (!formData.last_name.trim()) {
      setError("نام خانوادگی الزامی است");
      return;
    }
    if (!formData.phone.trim()) {
      setError("شماره تماس الزامی است");
      return;
    }
    if (!formData.address.trim()) {
      setError("آدرس الزامی است");
      return;
    }
    
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      const token = getToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      // Only send changed fields
      const changedFields = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== originalData[key]) {
          changedFields[key] = formData[key];
        }
      });
      
      const response = await updateUserProfile(changedFields, token);
      
      if (!response.err) {
        setSuccess(response.msg || "تغییرات با موفقیت ثبت شد و در حال بررسی است");
        setOriginalData(formData);
        
        // Update localStorage if name changed
        if (changedFields.first_name || changedFields.last_name) {
          const fullName = `${formData.first_name} ${formData.last_name}`.trim();
          localStorage.setItem("user_name", fullName);
        }
        
        // Redirect back after 2 seconds
        setTimeout(() => {
          router.push('/user');
        }, 2000);
      } else {
        setError(response.msg || "خطا در ثبت تغییرات");
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || "خطا در ثبت تغییرات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          <Link href="/user" className="p-2 text-gray-600">
            <ChevronLeft className="text-lg" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 mr-4">تنظیمات حساب کاربری</h1>
        </div>
      </div>
      
      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16"></div>
      
      {/* Desktop Header */}
      <div className="hidden lg:block w-full bg-white border-b border-gray-200 mb-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="h-16 flex items-center">
            <Link href="/user" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mr-4">تنظیمات حساب کاربری</h1>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">اطلاعات شخصی</h2>
          
          {/* Role Info (Read-only) */}
          {role && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">نقش: </span>
                {role === 'wholesaler' ? 'بنکدار' : 'فروشنده'}
              </p>
              {operateType && (
                <p className="text-sm text-blue-800 mt-1">
                  <span className="font-semibold">نحوه فعالیت: </span>
                  {operateType === 's' ? 'به صورت سرپایی فعالیت میکنم' : 'دارای مغازه هستم'}
                </p>
              )}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="نام خود را وارد کنید"
                required
              />
            </div>
            
            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام خانوادگی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="نام خانوادگی خود را وارد کنید"
                required
              />
            </div>
            
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شماره تماس <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="09123456789"
                maxLength="11"
                required
              />
            </div>
            
            {/* Phone 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شماره تماس دوم (اختیاری)
              </label>
              <input
                type="tel"
                name="phone2"
                value={formData.phone2}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="09123456789"
                maxLength="11"
              />
            </div>
            
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                آدرس محل فعالیت <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="آدرس کامل محل فعالیت خود را وارد کنید"
                required
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  ذخیره تغییرات
                </>
              )}
            </button>
            
            <Link
              href="/user"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              انصراف
            </Link>
          </div>
          
          {/* Info Note */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">توجه: </span>
              تغییرات شما پس از ثبت، برای بررسی مجدد ارسال می‌شود و پس از تایید اعمال خواهد شد.
            </p>
          </div>
        </form>
      </div>
      
      {/* Spacer for mobile bottom navbar */}
      <div className="lg:hidden h-24"></div>
    </div>
  );
}
