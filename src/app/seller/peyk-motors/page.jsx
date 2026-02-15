"use client";

import React, { useState, useEffect, useCallback } from "react";
import ServiceProviderCard from "../components/ServiceProviderCard";
import { getMotorcycleProviders } from "../../../api/serviceProvider";
import { FaMotorcycle, FaFilter, FaSearch, FaChevronDown, FaChevronUp, FaPhone } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import SellerNavbar from "../components/SellerNavbar";
const MotorcycleProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    home_to_intersection: false,
    available_on_load: false,
    personal_tasks: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // Fetch providers
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        ...(filters.home_to_intersection && { home_to_intersection: true }),
        ...(filters.available_on_load && { available_on_load: true }),
        ...(filters.personal_tasks && { personal_tasks: true }),
      };
      
      const response = await getMotorcycleProviders(params);
      setProviders(response.results || response || []);
      setTotalCount(response.count || (response.results || response).length);
    } catch (error) {
      console.error("Error fetching motorcycle providers:", error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);
  
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);
  
  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      home_to_intersection: false,
      available_on_load: false,
      personal_tasks: false,
    });
    setSearchTerm("");
  };
  
  const hasActiveFilters = Object.values(filters).some(value => value) || searchTerm;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SellerNavbar/>
      {/* هدر صفحه */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaMotorcycle className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  پیک موتورهای خدمت‌رسان
                </h1>
                <p className="text-gray-600 mt-1">
                  لیست پیک موتورهای معتبر برای حمل و نقل سریع و مطمئن
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                {totalCount} پیک موتور فعال
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
                    placeholder="جستجوی پیک موتور بر اساس نام، پلاک یا شماره موبایل ..."
                    className="w-full border border-gray-300 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              
              {/* دکمه‌های فیلتر */}
              <div className="flex flex-wrap gap-2">
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">در حال دریافت اطلاعات پیک موتورها...</p>
          </div>
        ) : providers.length === 0 ? (
          // Empty state
          <div className="text-center py-12 bg-white rounded-2xl shadow border border-gray-200">
            <FaMotorcycle className="text-gray-400 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">پیک موتوری یافت نشد</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {hasActiveFilters 
                ? "با فیلترهای انتخاب شده پیک موتوری موجود نیست. فیلترها را تغییر دهید."
                : "در حال حاضر پیک موتور فعالی در سیستم ثبت نشده است."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                type="motorcycle"
              />
            ))}
          </div>
        )}
      </div>
      
      {/* راهنما */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">راهنمای استفاده از پیک موتورها</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-blue-600 font-bold mb-2">1. انتخاب پیک موتور</div>
              <p className="text-gray-600 text-sm">پیک موتور مورد نظر خود را بر اساس ویژگی‌ها و محدوده کاری انتخاب کنید</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-green-600 font-bold mb-2">2. تماس مستقیم</div>
              <p className="text-gray-600 text-sm">با شماره تماس پیک موتور ارتباط بگیرید و جزییات را هماهنگ کنید</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-purple-600 font-bold mb-2">3. ارسال بار</div>
              <p className="text-gray-600 text-sm">پس از هماهنگی، بار خود را در مکان مورد توافق تحویل دهید</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorcycleProvidersPage;