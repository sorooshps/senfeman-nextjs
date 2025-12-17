"use client";

import React, { useState, useCallback, useEffect , useRef , useMemo } from "react";
import apiConfig from "../../../config/api.config";
import { FaChevronLeft, FaChevronDown, FaChevronUp, FaFilter } from "react-icons/fa6";
import { IoIosArrowBack, IoIosClose } from "react-icons/io";
import { useAuth } from "../../../hooks/useAuth";
import { searchProducts, getBrands } from "../../../api/seller";
import logo from "../../../assets/fonts/ic_neo.png";
import Image from "next/image";
import SellerNavbar from "./SellerNavbar";

// Cache for API responses
const productCache = new Map();
const brandCache = { data: null, timestamp: 0 };
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes cache expiry

const PAGE_SIZE = 20;

const ProductListPage = ({
  searchQuery,
  onBack,
  onProductSelect,
  initialProducts = [],
  subcategoryId = null,
  subcategoryName = ""
}) => {
  const { getToken } = useAuth('seller', { skipRoleRedirect: true });
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  
  // Filter states - store as objects {id, name}
  const [allBrands, setAllBrands] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [selectedColorIds, setSelectedColorIds] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [expandedFilters, setExpandedFilters] = useState({ brand: true, color: true, year: false });
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Fetch all brands once with caching
  const fetchBrands = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    
    // Check if we have valid cache
    if (brandCache.data && (Date.now() - brandCache.timestamp < CACHE_EXPIRY)) {
      setAllBrands(brandCache.data);
      return;
    }
    
    try {
      const response = await getBrands(token);
      const brandList = response.results || response || [];
      
      // Update cache
      brandCache.data = brandList;
      brandCache.timestamp = Date.now();
      
      setAllBrands(brandList);
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    }
  }, [getToken]);
  
  // Load brands on component mount
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);
  
  // Helper function to extract filter options from products
  const updateFilterOptions = useCallback((productList, allBrands) => {
    // Extract unique brand IDs from products
    const productBrandIds = [...new Set(productList.map(p => p.brand).filter(Boolean))];
    const brandsWithProducts = allBrands.filter(b => productBrandIds.includes(b.id));
    setAvailableBrands(brandsWithProducts);

    // Extract unique colors from products
    const colorsMap = new Map();
    productList.forEach(p => {
      if (p.colors && Array.isArray(p.colors)) {
        p.colors.forEach(c => {
          if (c.id && c.name) {
            colorsMap.set(c.id, c);
          }
        });
      }
    });
    setAvailableColors(Array.from(colorsMap.values()));
  }, []);

  // Request tracker to prevent duplicate requests
  const requestRef = useRef({ inProgress: false, params: null });
  
  // Fetch products with pagination and caching
  const fetchProducts = useCallback(async (page = 1, resetFilters = false) => {
    const token = getToken();
    if (!token) return;

    // Build params object
    const params = { page_size: PAGE_SIZE, page };
    if (searchQuery) params.q = searchQuery;
    if (subcategoryId) params.scategory = subcategoryId;
    if (!resetFilters && selectedBrandIds.length > 0) params.brand = selectedBrandIds.join(',');
    if (!resetFilters && selectedColorIds.length > 0) params.color = selectedColorIds.join(',');
    
    // Create cache key
    const cacheKey = JSON.stringify(params);
    
    // Prevent duplicate requests
    if (requestRef.current.inProgress && 
        JSON.stringify(requestRef.current.params) === cacheKey) {
      return;
    }
    
    // Check cache first
    if (productCache.has(cacheKey)) {
      const cachedData = productCache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        setProducts(cachedData.data);
        
        // Set pagination info from cached metadata
        const meta = cachedData.meta || {};
        setTotalCount(meta.total_items || cachedData.data.length);
        setHasNextPage(!!meta.has_next);
        setHasPrevPage(page > 1);
        setCurrentPage(page);
        
        // Extract filter options if needed
        if (page === 1 && resetFilters) {
          updateFilterOptions(cachedData.data, allBrands);
        }
        return;
      }
    }

    // Mark request as in progress
    requestRef.current = { inProgress: true, params };
    setLoading(true);
    
    try {
      const response = await searchProducts(params, token);
      const productList = response.results || response || [];
      const meta = response.meta || {};
      
      // Update cache
      productCache.set(cacheKey, {
        data: productList,
        meta,
        timestamp: Date.now()
      });
      
      setProducts(productList);
      
      // Update pagination state
      setTotalCount(meta.total_items || productList.length);
      setHasNextPage(!!meta.has_next);
      setHasPrevPage(page > 1);
      setCurrentPage(page);

      // Extract filter options if needed
      if (page === 1 && resetFilters) {
        updateFilterOptions(productList, allBrands);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
      requestRef.current.inProgress = false;
    }
  }, [getToken, searchQuery, subcategoryId, selectedBrandIds, selectedColorIds, allBrands, updateFilterOptions]);


  // Fetch initial products with memoized dependency array
  useEffect(() => {
    fetchProducts(1, true);
  }, [fetchProducts, searchQuery, subcategoryId]);

  // Fetch filtered products when filters change
  useEffect(() => {
    if (selectedBrandIds.length > 0 || selectedColorIds.length > 0) {
      setCurrentPage(1);
      fetchProducts(1, false);
    }
  }, [selectedBrandIds, selectedColorIds, fetchProducts]);

  // Pagination handlers
  const goToNextPage = () => {
    if (hasNextPage) {
      fetchProducts(currentPage + 1, false);
    }
  };

  const goToPrevPage = () => {
    if (hasPrevPage) {
      fetchProducts(currentPage - 1, false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const toggleFilter = (filter) => {
    setExpandedFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  const toggleBrand = (brandId) => {
    setSelectedBrandIds(prev => 
      prev.includes(brandId) ? prev.filter(b => b !== brandId) : [...prev, brandId]
    );
  };

  const toggleColor = (colorId) => {
    setSelectedColorIds(prev => 
      prev.includes(colorId) ? prev.filter(c => c !== colorId) : [...prev, colorId]
    );
  };

  const clearFilters = () => {
    setSelectedBrandIds([]);
    setSelectedColorIds([]);
  };

  // API base URL
  const API_BASE_URL = apiConfig.API_BASE_URL;

  // Memoized function to get product image URL
  const getProductImage = useCallback((product) => {
    if (!product?.images || product.images.length === 0) return null;
    
    const imageUrl = product.images[0].image_url;
    if (!imageUrl) return null;
    
    // If URL is already absolute (starts with http), return it as is
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // Remove '/media' prefix if it exists
    let processedUrl = imageUrl;
    if (processedUrl.startsWith('/media/')) {
      processedUrl = processedUrl.replace('/media', '');
    }
    
    // Make sure the URL doesn't have double slashes
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const formattedUrl = processedUrl.startsWith('/') ? processedUrl : `/${processedUrl}`;
    
    return `${baseUrl}${formattedUrl}`;
  }, []);

  // Create a memoized list of filtered brands to avoid unnecessary re-renders
  const filteredBrands = useMemo(() => 
    availableBrands.filter(brand => 
      brand.name.toLowerCase().includes(brandSearch.toLowerCase())
    ),
  [availableBrands, brandSearch]);


  const hasActiveFilters = selectedBrandIds.length > 0 || selectedColorIds.length > 0;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <SellerNavbar />
      
      {/* Mobile View */}
      <div className="lg:hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 text-gray-600">
                <IoIosArrowBack size={24} />
              </button>
              <h1 className="font-bold text-lg text-gray-900">
                {subcategoryName || searchQuery || 'محصولات'}
              </h1>
            </div>
            <button 
              onClick={() => setShowMobileFilter(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${hasActiveFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-600'}`}
            >
              <FaFilter className="text-sm" />
              <span className="text-sm">فیلتر</span>
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {selectedBrandIds.length + selectedColorIds.length}
                </span>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">{totalCount} محصول یافت شد</p>
        </div>

        {/* Product List */}
        <div className="px-4 py-4 pb-20">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">محصولی یافت نشد</div>
          ) : (
            <div className="space-y-3">
              {products.map((product, index) => (
                <div
                  key={product.id || index}
                  onClick={() => onProductSelect(product)}
                  className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4 cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {getProductImage(product) ? (
                      <Image 
                        src={getProductImage(product)} 
                        alt={product.title} 
                        width={64} 
                        height={64} 
                        className="w-full h-full object-contain"
                        unoptimized={getProductImage(product)?.includes('http')}
                      />
                    ) : (
                      <Image src={logo} alt={product.title} width={48} height={48} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{product.title}</h3>
                    {product.code && (
                      <p className="text-xs text-gray-500 mt-1">کد: {product.code}</p>
                    )}
                  </div>
                  <FaChevronLeft className="text-gray-400 shrink-0" />
                </div>
              ))}
              
              {/* Mobile Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6 pb-4">
                  <button
                    onClick={goToPrevPage}
                    disabled={!hasPrevPage}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      hasPrevPage 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    صفحه قبل
                  </button>
                  <span className="text-sm text-gray-600">
                    {currentPage} از {totalPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={!hasNextPage}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      hasNextPage 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    صفحه بعد
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Filter Modal */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="absolute top-0 left-0 right-0 bg-white rounded-b-2xl max-h-[80vh] overflow-y-auto">
              {/* Filter Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaFilter className="text-gray-600" />
                  <span className="font-bold text-gray-900">فیلترها</span>
                </div>
                <div className="flex items-center gap-4">
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-red-500 text-sm flex items-center gap-1">
                      <IoIosClose size={16} />
                      حذف فیلترها
                    </button>
                  )}
                  <button onClick={() => setShowMobileFilter(false)} className="p-2">
                    <IoIosClose size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleFilter('brand')}
                  className="w-full px-4 py-4 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900">برند</span>
                  {expandedFilters.brand ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                </button>
                {expandedFilters.brand && (
                  <div className="px-4 pb-4">
                    <input
                      type="text"
                      placeholder="جستجوی برند..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
                    />
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredBrands.map((brand) => (
                        <label key={brand.id} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrandIds.includes(brand.id)}
                            onChange={() => toggleBrand(brand.id)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{brand.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Color Filter */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleFilter('color')}
                  className="w-full px-4 py-4 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900">رنگ محصول</span>
                  {expandedFilters.color ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                </button>
                {expandedFilters.color && (
                  <div className="px-4 pb-4 space-y-2 max-h-48 overflow-y-auto">
                    {availableColors.map((color) => (
                      <label key={color.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedColorIds.includes(color.id)}
                          onChange={() => toggleColor(color.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{color.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Apply Button */}
              <div className="p-4">
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
                >
                  اعمال فیلتر
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8">
          {/* Main Content - Product List */}
          <div className="col-span-3 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <IoIosArrowBack size={20} className="text-gray-600" />
                </button>
                <h1 className="font-bold text-xl text-gray-900">
                  {subcategoryName || searchQuery || 'محصولات'}
                </h1>
              </div>
              <span className="text-sm text-gray-500">{totalCount} محصول یافت شد</span>
            </div>

            {/* Product List */}
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">محصولی یافت نشد</div>
              ) : (
                products.map((product, index) => (
                  <div
                    key={product.id || index}
                    onClick={() => onProductSelect(product)}
                    className="px-6 py-4 flex items-center gap-6 cursor-pointer hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-28 h-28 shrink-0 bg-gray-100 rounded-xl flex items-center justify-center">
                    {getProductImage(product) ? (
                      <Image 
                        src={getProductImage(product)} 
                        alt={product.title} 
                        width={112} 
                        height={112} 
                        className="w-full h-full object-contain p-2"
                        unoptimized={getProductImage(product)?.includes('http')}
                      />
                    ) : (
                      <Image src={logo} alt={product.title} width={64} height={64} />
                    )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-base">{product.title}</h3>
                      {product.code && (
                        <p className="text-sm text-gray-500 mt-1">کد محصول: {product.code}</p>
                      )}
                    </div>
                    <FaChevronLeft className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                ))
              )}
            </div>
            
            {/* Desktop Pagination */}
            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-center gap-4 py-6 border-t border-gray-100">
                <button
                  onClick={goToPrevPage}
                  disabled={!hasPrevPage}
                  className={`px-6 py-2 rounded-lg text-sm font-medium ${
                    hasPrevPage 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  صفحه قبل
                </button>
                <span className="text-sm text-gray-600">
                  صفحه {currentPage} از {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={!hasNextPage}
                  className={`px-6 py-2 rounded-lg text-sm font-medium ${
                    hasNextPage 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  صفحه بعد
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Filters */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 sticky top-8">
              {/* Filter Header */}
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-600" />
                  <span className="font-bold text-gray-900">فیلترها</span>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-red-500 text-sm flex items-center gap-1">
                    <IoIosClose size={16} />
                    حذف فیلترها
                  </button>
                )}
              </div>

              {/* Brand Filter */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleFilter('brand')}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">برند</span>
                  {expandedFilters.brand ? <FaChevronUp className="text-gray-400 text-sm" /> : <FaChevronDown className="text-gray-400 text-sm" />}
                </button>
                {expandedFilters.brand && (
                  <div className="px-5 pb-4">
                    <input
                      type="text"
                      placeholder="جستجوی برند ..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-blue-400"
                    />
                    <div className="space-y-3 max-h-56 overflow-y-auto">
                      {filteredBrands.map((brand) => (
                        <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedBrandIds.includes(brand.id)}
                            onChange={() => toggleBrand(brand.id)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">{brand.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Color Filter */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleFilter('color')}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">رنگ محصول</span>
                  {expandedFilters.color ? <FaChevronUp className="text-gray-400 text-sm" /> : <FaChevronDown className="text-gray-400 text-sm" />}
                </button>
                {expandedFilters.color && (
                  <div className="px-5 pb-4 space-y-3 max-h-56 overflow-y-auto">
                    {availableColors.map((color) => (
                      <label key={color.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedColorIds.includes(color.id)}
                          onChange={() => toggleColor(color.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{color.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Year Filter */}
              <div>
                <button
                  onClick={() => toggleFilter('year')}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">سال ساخت</span>
                  {expandedFilters.year ? <FaChevronUp className="text-gray-400 text-sm" /> : <FaChevronDown className="text-gray-400 text-sm" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
