"use client";

import React, { useState, useEffect, useCallback } from "react";
import ServiceProviderCard from "../components/ServiceProviderCard";
import { getLiftProviders } from "../../../api/serviceProvider";
import { FaWarehouse, FaFilter, FaSearch, FaChevronDown, FaChevronUp, FaPhone } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import SellerNavbar from "../components/SellerNavbar";
const LiftProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    nationality: '',
    moving_tasks: false,
    always_available: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // ملیت‌های موجود
  const nationalities = [
    { value: '', label: 'همه ملیت‌ها' },
    { value: 'ایرانی', label: 'ایرانی' },
    { value: 'افغانستانی', label: 'افغانستانی' },
    { value: 'پاکستانی', label: 'پاکستانی' },
    { value: 'عراقی', label: 'عراقی' },
  ];
  
  // Fetch providers
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        ...(filters.nationality && { nationality: filters.nationality }),
        ...(filters.moving_tasks && { moving_tasks: true }),
        ...(filters.always_available && { always_available: true }),
      };
      
      const response = await getLiftProviders(params);
      setProviders(response.results || response || []);
      setTotalCount(response.count || (response.results || response).length);
    } catch (error) {
      console.error("Error fetching lift providers:", error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);
  
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);
  
  const handleFilterChange = (filterName, value = null) => {
    if (value !== null) {
      setFilters(prev => ({
        ...prev,
        [filterName]: value
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterName]: !prev[filterName]
      }));
    }
  };
  
  const clearFilters = () => {
    setFilters({
      nationality: '',
      moving_tasks: false,
      always_available: false,
    });
    setSearchTerm("");
  };
  
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'nationality') return value !== '';
    return value === true;
  }) || searchTerm;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SellerNavbar/>
      {/* هدر صفحه */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaWarehouse className="text-purple-600 text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  بالابرهای خدمت‌رسان
                </h1>
                <p className="text-gray-600 mt-1">
                  لیست بالابرهای معتبر برای حمل بارهای سنگین و اسباب کشی
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                {totalCount} بالابر فعال
              </span>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaFilter />
                فیلترها
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* بخش فیلترها */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* جستجو */}
              <div className="relative flex-1">
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجوی بالابر بر اساس نام، ملیت یا شماره موبایل ..."
                    className="w-full border border-gray-300 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              </div>
              
              {/* دکمه‌های فیلتر */}
              <div className="flex flex-wrap gap-2">
                {/* انتخاب ملیت */}
                <select
                  value={filters.nationality}
                  onChange={(e) => handleFilterChange('nationality', e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:border-purple-500"
                >
                  {nationalities.map((nation) => (
                    <option key={nation.value} value={nation.value}>
                      {nation.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => handleFilterChange('moving_tasks')}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                    filters.moving_tasks 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>اسباب کشی</span>
                  {filters.moving_tasks ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
                
                <button
                  onClick={() => handleFilterChange('always_available')}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                    filters.always_available 
                      ? 'bg-green-50 border-green-300 text-green-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>همیشه در دسترس</span>
                  {filters.always_available ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
                
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 flex items-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    <IoIosClose size={18} />
                    حذف فیلترها
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* محتوای اصلی */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          // Loading state
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">در حال دریافت اطلاعات بالابرها...</p>
          </div>
        ) : providers.length === 0 ? (
          // Empty state
          <div className="text-center py-12 bg-white rounded-2xl shadow border border-gray-200">
            <FaWarehouse className="text-gray-400 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">بالابری یافت نشد</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {hasActiveFilters 
                ? "با فیلترهای انتخاب شده بالابری موجود نیست. فیلترها را تغییر دهید."
                : "در حال حاضر بالابر فعالی در سیستم ثبت نشده است."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                حذف فیلترها
              </button>
            )}
          </div>
        ) : (
          // Providers list
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {providers.map((provider, index) => (
              <ServiceProviderCard 
                key={provider.id || index} 
                provider={provider} 
                type="lift"
              />
            ))}
          </div>
        )}
      </div>
      
      {/* راهنما */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">راهنمای استفاده از بالابرها</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-purple-600 font-bold mb-2">1. انتخاب بالابر</div>
              <p className="text-gray-600 text-sm">بالابر مناسب را بر اساس تجربه، امکانات و در دسترس بودن انتخاب کنید</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-green-600 font-bold mb-2">2. بازدید و برآورد</div>
              <p className="text-gray-600 text-sm">از محل کار بازدید شود و هزینه بر اساس وزن و پیچیدگی کار محاسبه شود</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-blue-600 font-bold mb-2">3. انجام کار</div>
              <p className="text-gray-600 text-sm">کار با نظارت شما انجام شده و در پایان هزینه توافق شده پرداخت شود</p>
            </div>
          </div>
          
          {/* نکات ایمنی */}
          <div className="mt-6 pt-6 border-t border-purple-200">
            <h4 className="font-bold text-gray-800 mb-3">نکات ایمنی مهم:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-600">قبل از کار از سالم بودن تجهیزات بالابر اطمینان حاصل کنید</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-600">در زمان کار بالابر، از محل فاصله بگیرید</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-600">بارهای سنگین را به صورت تدریجی و با احتیاط جابجا کنید</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-600">در صورت وزش باد شدید، کار را متوقف کنید</span>
              </li>
            </ul>
          </div>
          
          {/* کاربردهای رایج */}
          <div className="mt-6 pt-6 border-t border-purple-200">
            <h4 className="font-bold text-gray-800 mb-3">کاربردهای رایج بالابر:</h4>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">جابجایی کالاهای سنگین</span>
              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">اسباب کشی منزل</span>
              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">بارگیری در انبار</span>
              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">کارهای ساختمانی</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiftProvidersPage;