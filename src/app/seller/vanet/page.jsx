"use client";

import React, { useState, useEffect, useCallback } from "react";
import ServiceProviderCard from "../components/ServiceProviderCard";
import { getVanProviders } from "../../../api/serviceProvider";
import { FaTruck, FaFilter, FaSearch, FaChevronDown, FaChevronUp, FaPhone } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import SellerNavbar from "../components/SellerNavbar";
const VanProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    working_area: '',
    home_to_intersection: false,
    available_on_load: false,
    personal_tasks: false,
    has_lift: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // مناطق کاری
  const workingAreas = [
    { value: '', label: 'همه مناطق' },
    { value: 'tehran_only', label: 'فقط تهران' },
    { value: 'tehran_suburbs', label: 'حومه تهران' },
    { value: 'outside_province', label: 'خارج استان' },
  ];
  
  // Fetch providers
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        ...(filters.working_area && { working_area: filters.working_area }),
        ...(filters.home_to_intersection && { home_to_intersection: true }),
        ...(filters.available_on_load && { available_on_load: true }),
        ...(filters.personal_tasks && { personal_tasks: true }),
        ...(filters.has_lift && { has_lift: true }),
      };
      
      const response = await getVanProviders(params);
      setProviders(response.results || response || []);
      setTotalCount(response.count || (response.results || response).length);
    } catch (error) {
      console.error("Error fetching van providers:", error);
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
      working_area: '',
      home_to_intersection: false,
      available_on_load: false,
      personal_tasks: false,
      has_lift: false,
    });
    setSearchTerm("");
  };
  
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'working_area') return value !== '';
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
              <div className="p-3 bg-green-100 rounded-xl">
                <FaTruck className="text-green-600 text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  وانت‌های باربری
                </h1>
                <p className="text-gray-600 mt-1">
                  لیست وانت‌های معتبر برای حمل بارهای سبک و متوسط
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                {totalCount} وانت فعال
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
                    placeholder="جستجوی وانت بر اساس نام، نوع ماشین، پلاک یا شماره موبایل ..."
                    className="w-full border border-gray-300 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>
              
              {/* دکمه‌های فیلتر */}
              <div className="flex flex-wrap gap-2">
                {/* انتخاب منطقه کاری */}
                <select
                  value={filters.working_area}
                  onChange={(e) => handleFilterChange('working_area', e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:border-green-500"
                >
                  {workingAreas.map((area) => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => handleFilterChange('home_to_intersection')}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                    filters.home_to_intersection 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>خونه من به سه راه</span>
                  {filters.home_to_intersection ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
                
                <button
                  onClick={() => handleFilterChange('available_on_load')}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                    filters.available_on_load 
                      ? 'bg-green-50 border-green-300 text-green-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>هروقت بار بخوره</span>
                  {filters.available_on_load ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
                
                <button
                  onClick={() => handleFilterChange('personal_tasks')}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                    filters.personal_tasks 
                      ? 'bg-purple-50 border-purple-300 text-purple-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>کار شخصی</span>
                  {filters.personal_tasks ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
                
                <button
                  onClick={() => handleFilterChange('has_lift')}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                    filters.has_lift 
                      ? 'bg-orange-50 border-orange-300 text-orange-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>بالابر دارم</span>
                  {filters.has_lift ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">در حال دریافت اطلاعات وانت‌ها...</p>
          </div>
        ) : providers.length === 0 ? (
          // Empty state
          <div className="text-center py-12 bg-white rounded-2xl shadow border border-gray-200">
            <FaTruck className="text-gray-400 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">وانتی یافت نشد</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {hasActiveFilters 
                ? "با فیلترهای انتخاب شده وانتی موجود نیست. فیلترها را تغییر دهید."
                : "در حال حاضر وانت فعالی در سیستم ثبت نشده است."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                type="van"
              />
            ))}
          </div>
        )}
      </div>
      
      {/* راهنما */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">راهنمای استفاده از وانت‌ها</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-green-600 font-bold mb-2">1. انتخاب وانت مناسب</div>
              <p className="text-gray-600 text-sm">وانتی را انتخاب کنید که با محدوده کاری و ویژگی‌های مورد نیاز شما همخوانی دارد</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-blue-600 font-bold mb-2">2. هماهنگی جزییات</div>
              <p className="text-gray-600 text-sm">با راننده تماس بگیرید و وزن بار، مسیر و هزینه را هماهنگ کنید</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-purple-600 font-bold mb-2">3. بارگیری و حمل</div>
              <p className="text-gray-600 text-sm">بار خود را در محل توافق شده تحویل دهید و تا مقصد همراه باشید</p>
            </div>
          </div>
          
          {/* نکات مهم */}
          <div className="mt-6 pt-6 border-t border-green-200">
            <h4 className="font-bold text-gray-800 mb-3">نکات مهم:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-600">ظرفیت استاندارد وانت حدود ۱ تا ۱.۵ تن است</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-600">بعضی وانت‌ها مجهز به بالابر برای بارهای سنگین هستند</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-600">قبل از بارگیری، از سالم بودن وسیله نقلیه اطمینان حاصل کنید</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-600">هزینه را قبل از حرکت توافق کنید</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VanProvidersPage;