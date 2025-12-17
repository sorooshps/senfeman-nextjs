"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { useAuth } from '../../../hooks/useAuth';
import Layout from '../../../components/Layout';
import apiConfig from '../../../config/api.config';
import {
  FaCube,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaPlus,
  FaImage,
  FaEllipsisV,
  FaTrashAlt,
  FaAngleLeft,
  FaAngleRight,
} from 'react-icons/fa';
import { ChevronDown, ListFilterIcon, Trash } from 'lucide-react';
import { getWholesalerProducts, getWholesalerCategoryProducts, deleteWholesalerProduct } from '../../../api/wholesaler';

export default function DashboardContent() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'category'
  const [individualProducts, setIndividualProducts] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { isAuthenticated, loading, error: authError, getToken } = useAuth('wholesaler');
  
  // API base URL for image handling
  const API_BASE_URL = apiConfig.API_BASE_URL;

  // Prevent double loading
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Load products - wrapped in useCallback to prevent recreation
  const loadProducts = useCallback(async (page = 1, size = 10, tab = activeTab) => {
    if (isLoadingRef.current) return;
    
    const token = getToken();
    if (!token) return;

    isLoadingRef.current = true;
    setLoadingProducts(true);
    
    try {
      if (tab === 'individual') {
        const data = await getWholesalerProducts(token, { page, page_size: size });
        setIndividualProducts(data.results || data);
        if (data.count) {
          setTotalCount(data.count);
          setTotalPages(Math.ceil(data.count / size));
        }
      } else {
        const data = await getWholesalerCategoryProducts(token);
        setCategoryProducts(data.results || data);
        if (data.count) {
          setTotalCount(data.count);
          setTotalPages(Math.ceil(data.count / size));
        }
      }
      setCurrentPage(page);
    } catch (err) {
      // Silent error handling
    } finally {
      setLoadingProducts(false);
      isLoadingRef.current = false;
    }
  }, [getToken, activeTab]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadProducts(newPage, 10);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    loadProducts(1, newSize);
  };

  // Load products when component mounts or tab changes
  useEffect(() => {
    if (isAuthenticated) {
      if (!hasLoadedRef.current || activeTab) {
        hasLoadedRef.current = true;
        setCurrentPage(1);
        loadProducts(1, 10, activeTab);
      }
    }
  }, [isAuthenticated, activeTab, loadProducts]);

  // Get product image
  const getProductImage = (product) => {
    if (!product) return null;
    
    // Check if product has images array
    if (product.images && product.images.length > 0) {
      let imageUrl = product.images[0].image_url;
      if (!imageUrl) return null;
      
      // If URL is already absolute (starts with http), return it as is
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      // Remove '/media' prefix if it exists
      if (imageUrl.startsWith('/media/')) {
        imageUrl = imageUrl.replace('/media', '');
      }
      
      // Make sure the URL doesn't have double slashes
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const formattedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      
      return `${baseUrl}${formattedUrl}`;
    } 
    // Fallback to direct image property if available
    else if (product.image) {
      let imagePath = product.image;
      
      if (imagePath.includes('http')) {
        return imagePath;
      } else {
        // Remove '/media' prefix if it exists
        if (imagePath.startsWith('/media/')) {
          imagePath = imagePath.replace('/media', '');
        }
        
        // Make sure the URL doesn't have double slashes
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        imagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        
        return `${baseUrl}${imagePath}`;
      }
    }
    
    return null;
  };

  // Handle delete product
  const handleDeleteProduct = async (id) => {
    setDeletingId(id);
    try {
      const token = getToken();
      if (!token) return;
      await deleteWholesalerProduct(id, token);
      loadProducts(currentPage, pageSize, activeTab);
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-sm">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>خطا: {error}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const products = [
    {
      id: 1,
      name: 'سرخ کن اسنوا ۱۲۴',
      category: 'پخت و پز',
      brand: 'اسنوا',
      code: '#۴۶۴۵۶۹',
      image: 'https://via.placeholder.com/40',
    },
    {
      id: 2,
      name: 'سرخ کن اسنوا ۱۲۴',
      category: 'پخت و پز',
      brand: 'اسنوا',
      code: '#۴۶۴۵۶۹',
      image: 'https://via.placeholder.com/40',
    },
    {
      id: 3,
      name: 'سرخ کن اسنوا ۱۲۴',
      category: 'پخت و پز',
      brand: 'اسنوا',
      code: '#۴۶۴۵۶۹',
      image: 'https://via.placeholder.com/40',
    },
    {
      id: 4,
      name: 'سرخ کن اسنوا ۱۲۴',
      category: 'پخت و پز',
      brand: 'اسنوا',
      code: '#۴۶۴۵۶۹',
      image: 'https://via.placeholder.com/40',
    },
  ];

  const cards = [
    {
      id: 1,
      title: "تعداد کل کالا‌های ثبت شده",
      icon: <FaCube className="text-blue-500 text-lg" />,
      iconBg: "bg-blue-100",
      value: "۵,۰۰۰",
      stats: "۴.۴٪ نسبت به ماه پیش",
      views: "محصولات شما ۱۲۴۵ بار دیده شده"
    },
    {
      id: 2,
      title: "محصولات با موجودی پایین",
      icon: <FaClock className="text-orange-500 text-lg" />,
      iconBg: "bg-orange-100",
      value: "۵,۰۰۰",
      stats: "۴.۴٪ نسبت به ماه پیش",
      views: "محصولات شما ۱۲۴۵ بار دیده شده"
    },
    {
      id: 3,
      title: "محصولات با اتمام موجودی",
      icon: <FaTrashAlt className="text-red-500 text-lg" />,
      iconBg: "bg-red-100",
      value: "۵,۰۰۰",
      stats: "۴.۴٪ نسبت به ماه پیش",
      views: "محصولات شما ۱۲۴۵ بار دیده شده"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Get current products based on active tab
  const getCurrentProducts = () => {
    return activeTab === 'individual' ? individualProducts : categoryProducts;
  };

  return (
    <Layout pageTitle="داشبورد">
      <div className="md:p-6 bg-gray-100 min-h-screen">
        {/* Cards Section - Desktop Grid & Mobile Slider */}
        <div className="relative mb-8">
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div key={card.id} className="bg-white rounded-lg shadow-sm p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-700 font-medium">{card.title}</h3>
                  <div className={`${card.iconBg} p-2 rounded-full`}>
                    {card.icon}
                  </div>
                </div>
                <div className="flex items-end justify-between mb-4">
                  <span className="text-3xl font-bold text-gray-800">{card.value}</span>
                </div>
                <div className="flex flex-col gap-4 justify-start text-gray-500 text-sm">
                  <div className="flex items-center bg-gray-100 rounded-lg p-2 text-green-500 text-sm">
                    <FaChartLine className="ml-1" />
                    {card.stats}
                  </div>
                  <div className='flex items-center bg-gray-100 rounded-lg p-2'>
                    <FaCheckCircle className="ml-1 text-green-500" />
                    <span className="text-gray-600">{card.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Slider */}
          <div className="md:hidden relative overflow-hidden rounded-lg m-4" dir="ltr">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              onTouchStart={(e) => {
                const touchStartX = e.touches[0].clientX;
                let touchCurrentX = touchStartX;

                const handleTouchMove = (moveEvent) => {
                  touchCurrentX = moveEvent.touches[0].clientX;
                };

                const handleTouchEnd = () => {
                  const diff = touchStartX - touchCurrentX;
                  const swipeThreshold = 50;

                  if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) {
                      // Swipe left - next slide
                      nextSlide();
                    } else {
                      // Swipe right - previous slide
                      prevSlide();
                    }
                  }

                  document.removeEventListener('touchmove', handleTouchMove);
                  document.removeEventListener('touchend', handleTouchEnd);
                };

                document.addEventListener('touchmove', handleTouchMove);
                document.addEventListener('touchend', handleTouchEnd, { once: true });
              }}
            >
              {cards.map((card) => (
                <div key={card.id} className="w-full flex-shrink-0 bg-white rounded-lg shadow-sm p-6" dir="rtl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-gray-700 font-medium">{card.title}</h3>
                    <div className={`${card.iconBg} p-2 rounded-full`}>
                      {card.icon}
                    </div>
                  </div>
                  <div className="flex items-end justify-between mb-4">
                    <span className="text-3xl font-bold text-gray-800">{card.value}</span>
                  </div>
                  <div className="flex flex-col gap-4 justify-start text-gray-500 text-sm">
                    <div className="flex items-center bg-gray-100 rounded-lg p-2 text-green-500 text-sm">
                      <FaChartLine className="ml-1" />
                      {card.stats}
                    </div>
                    <div className='flex items-center bg-gray-100 rounded-lg p-2'>
                      <FaCheckCircle className="ml-1 text-green-500" />
                      <span className="text-gray-600">{card.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-4 space-x-2">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentSlide ? 'bg-blue-500 w-4' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Add Product Box - Responsive */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
          {/* Desktop Layout */}
          <div className="hidden md:flex flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gray-200 p-3 rounded-lg">
                <ListFilterIcon className=''/>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">افزودن محصولات</h3>
              </div>
            </div>
            <Link href="/wholesaler/add-product" className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md md:bg-blue-500 md:text-white md:hover:bg-blue-600 md:shadow-sm md:hover:shadow-md">
              <FaPlus className="text-lg" />
              <span className="font-medium md:font-medium">افزودن محصولات</span>
            </Link>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Top Part - Icon and Title */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-4">
              <div className="bg-gray-200 p-3 rounded-lg">
                <ListFilterIcon className=''/>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">افزودن محصولات</h3>
              </div>
            </div>
            {/* Bottom Part - Button */}
            <div className="flex justify-center">
              <Link href="/wholesaler/add-product" className="flex items-center gap-2 px-6 py-3 text-blue-500 transition-all duration-200 w-full justify-center">
                <FaPlus className="text-lg" />
                <span className="font-medium">افزودن محصولات</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Product List Section - Responsive */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header - Same for both */}
          <div className="flex justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="md:text-xl text-lg font-semibold text-gray-800">لیست محصولات من</h2>
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
              مرتب سازی
              <ChevronDown/>
            </button>
          </div>

          {/* Search Input - Below on mobile */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="جستجو در محصولات..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Tabs Section */}
          <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
            <p className='hidden md:block'>
              <span className="font-semibold text-gray-800">{getCurrentProducts().length}</span>
              محصول موجود می باشد
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => handleTabChange('individual')}
                className={`pb-1 border-b-2 font-medium transition-colors duration-200 ${
                  activeTab === 'individual' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                محصولات تکی
              </button>
              <button 
                onClick={() => handleTabChange('category')}
                className={`pb-1 border-b-2 font-medium transition-colors duration-200 ${
                  activeTab === 'category' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                محصولات کلی
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loadingProducts && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="mr-3 text-gray-600">در حال بارگذاری...</span>
            </div>
          )}

          {/* Desktop Table */}
          {!loadingProducts && (
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'category' ? 'دسته بندی محصول' : 'نام محصول'}
                    </th>
                    {activeTab === 'individual' && (
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">کد محصول</th>
                    )}
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">برند</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">دسته بندی</th>
                    <th scope="col" className="sticky left-0 bg-gray-50 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider z-10"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCurrentProducts().length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === 'individual' ? 5 : 4} className="px-6 py-12 text-center text-gray-500">
                        {activeTab === 'category' ? 'هیچ محصول کلی ثبت نشده است' : 'هیچ محصول تکی ثبت نشده است'}
                      </td>
                    </tr>
                  ) : (
                    getCurrentProducts().map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {activeTab === 'individual' ? (
                              <>
                                <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center ml-3">
                                  {getProductImage(item.product) ? (
                                    <Image 
                                      src={getProductImage(item.product)} 
                                      alt={item.product?.title} 
                                      width={40} 
                                      height={40} 
                                      className="h-full w-full object-contain"
                                      unoptimized={getProductImage(item.product)?.includes('http')}
                                    />
                                  ) : (
                                    <div className="bg-gray-200 h-full w-full"></div>
                                  )}
                                </div>
                                <div className="text-sm font-medium text-gray-900">{item.product?.title}</div>
                              </>  
                            ) : (
                              <div className="text-sm font-medium text-gray-900">
                                {item.categoryName} - {item.brandNames?.join(', ')}
                              </div>
                            )}
                          </div>
                        </td>
                        {activeTab === 'individual' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product?.code}</td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activeTab === 'individual' ? item.product?.brand?.name : item.brandNames?.join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activeTab === 'individual' ? item.product?.categories?.[0]?.name : item.categoryName}
                        </td>
                        <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap text-left text-sm font-medium z-10">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">جزئیات محصول</button>
                            <button 
                              onClick={() => handleDeleteProduct(item.id)}
                              className="bg-gray-200 hover:bg-red-200 p-2 rounded-lg transition-colors"
                              disabled={deletingId === item.id}
                            >
                              <Trash className={`w-4 h-4 ${deletingId === item.id ? 'animate-pulse text-red-500' : ''}`}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Product List */}
          {!loadingProducts && (
            <div className="md:hidden space-y-4">
              {getCurrentProducts().length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {activeTab === 'category' ? 'هیچ محصول کلی ثبت نشده است' : 'هیچ محصول تکی ثبت نشده است'}
                </div>
              ) : (
                getCurrentProducts().map((item) => (
                  <div key={item.id} className="border-b border-gray-200 p-4">
                    {/* Top Part */}
                    <div className="flex justify-between items-start mb-3">
                      {/* Right - Product Image and Name */}
                      <div className="flex items-center gap-3">
                        {activeTab === 'individual' ? (
                          <>
                            <div className="h-8 w-8 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
                              {getProductImage(item.product) ? (
                                <Image 
                                  src={getProductImage(item.product)} 
                                  alt={item.product?.title} 
                                  width={32} 
                                  height={32} 
                                  className="h-full w-full object-contain"
                                  unoptimized={getProductImage(item.product)?.includes('http')}
                                />
                              ) : (
                                <div className="bg-gray-200 h-full w-full"></div>
                              )}
                            </div>
                            <div className="text-sm font-bold text-gray-900">{item.product?.title}</div>
                          </>  
                        ) : (
                          <div className="text-sm font-bold text-gray-900">
                            {item.categoryName}
                          </div>
                        )}
                      </div>
                      {/* Left - Trash Icon */}
                      <button 
                        onClick={() => handleDeleteProduct(item.id)}
                        className="bg-gray-200 hover:bg-red-200 p-2 rounded-lg transition-colors"
                        disabled={deletingId === item.id}
                      >
                        <Trash className={`w-4 h-4 ${deletingId === item.id ? 'animate-pulse text-red-500' : ''}`}/>
                      </button>
                    </div>

                    {/* Bottom Part */}
                    <div className="flex justify-between items-center">
                      {/* Right - Product Code and Brand */}
                      <div className="text-sm items-baseline flex gap-4 text-gray-800">
                        {activeTab === 'individual' && (
                          <div>{item.product?.code}</div>
                        )}
                        {activeTab === 'individual' && (
                          <span className='text-gray-300 text-3xl font-bold'>.</span>
                        )}
                        <div>
                          {activeTab === 'individual' 
                            ? item.product?.brand?.name 
                            : item.brandNames?.join(', ')
                          }
                        </div>
                      </div>
                      {/* Left - Category */}
                      <div className="text-xs rounded-lg font-semibold p-2 border border-gray-300 text-gray-800">
                        {activeTab === 'individual' 
                          ? item.product?.categories?.[0]?.name 
                          : item.categoryName
                        }
                      </div>
                    </div>
                    {activeTab === 'category' && (
                      <div className="mt-2 text-xs text-gray-600">
                        برندها: {item.brandNames?.join(', ')}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            {/* Desktop - Full pagination */}
            <div className="hidden md:flex items-center text-sm text-gray-700">
              نمایش
              <select 
                className="mx-2 p-1 border border-gray-300 rounded-md"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              >
                <option value={10}>۱۰</option>
                <option value={20}>۲۰</option>
                <option value={50}>۵۰</option>
              </select>
              آیتم از <span className="font-semibold ml-1">{totalCount}</span> آیتم جدول
            </div>

            {/* Desktop Pagination */}
            <nav className="hidden md:relative md:z-0 md:inline-flex rounded-md shadow-sm -space-x-px rtl:space-x-reverse" aria-label="Pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <FaAngleRight className="h-5 w-5" aria-hidden="true" />
              </button>
              {[...Array(Math.min(3, totalPages))].map((_, i) => (
                <button 
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === i + 1 
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              {totalPages > 4 && <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>}
              {totalPages > 3 && (
                <button 
                  onClick={() => handlePageChange(totalPages)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === totalPages 
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {totalPages}
                </button>
              )}
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <FaAngleLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>

            {/* Mobile - Only chevrons, page numbers, and dots */}
            <div className="flex md:hidden items-center justify-center space-x-2 w-full">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <FaAngleRight className="h-4 w-4 text-gray-600" />
              </button>

              {[...Array(Math.min(3, totalPages))].map((_, i) => (
                <button 
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    currentPage === i + 1 
                      ? 'bg-blue-300 text-blue-500 border border-blue-500' 
                      : 'border border-gray-600 text-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              {totalPages > 4 && <span className="text-gray-400">•••</span>}

              {totalPages > 3 && (
                <button 
                  onClick={() => handlePageChange(totalPages)}
                  className={`px-3 py-1 text-sm font-semibold rounded-md ${
                    currentPage === totalPages 
                      ? 'bg-blue-300 text-blue-500 border border-blue-500' 
                      : 'border border-gray-600 text-gray-700'
                  }`}
                >
                  {totalPages}
                </button>
              )}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <FaAngleLeft className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}