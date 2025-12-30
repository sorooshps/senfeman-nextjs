"use client";

import React, { useState, useCallback, useEffect , useRef , useMemo } from "react";
import apiConfig from "../../../config/api.config";
import { FaChevronLeft, FaChevronDown, FaChevronUp, FaFilter } from "react-icons/fa6";
import { IoIosArrowBack, IoIosClose } from "react-icons/io";
import { useAuth } from "../../../hooks/useAuth";
import { searchProducts, getBrands, getColors } from "../../../api/seller";
import logo from "../../../assets/fonts/LOGO_SVG.svg";
import Image from "next/image";
import SellerNavbar from "./SellerNavbar";
import ImageModal from "../../../components/ImageModal";

// Cache for API responses
const productCache = new Map();
const brandCache = { data: null, timestamp: 0 };
const colorCache = { data: null, timestamp: 0 };
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
  
  // Image modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedProductTitle, setSelectedProductTitle] = useState("");

  // Map color names to default hex codes when color_code is missing
  const getDefaultColorCode = useCallback((colorName) => {
    const colorMap = {
      'مشکی': '#000000',
      'استیل': '#CCCCCC',
      'سفید': '#FFFFFF',
      'خاکستری': '#808080',
      'استیل مشکی': '#333333',
      'آبی': '#0000FF',
      'قرمز': '#FF0000',
      'کرم': '#FFFDD0',
      'صورتی': '#FFC0CB',
      'سبز': '#00FF00',
      'نارنجی': '#FFA500',
      'زرد': '#FFFF00',
      'قهوه ای': '#A52A2A',
      'سرمه ای': '#000080',
      'دودی': '#696969',
      'نقره ای': '#C0C0C0',
      'رزگلد': '#B76E79',
      'طلایی': '#FFD700',
      'بنفش': '#800080',
      'بژ': '#F5F5DC',
      'نوک مدادی': '#2F4F4F',
      'مسی': '#B87333',
      'سیلور': '#C0C0C0',
    };
    return colorMap[colorName] || '#EEEEEE';
  }, []);

  // Add color codes to colors that are missing them
  const enhanceColorData = useCallback((colors) => {
    return colors.map(color => ({
      ...color,
      color_code: color.color_code || getDefaultColorCode(color.name)
    }));
  }, [getDefaultColorCode]);

  // Fetch all brands once with caching
  const fetchBrands = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    
    // Check if we have valid cache
    if (brandCache.data && (Date.now() - brandCache.timestamp < CACHE_EXPIRY)) {
      setAllBrands(brandCache.data);
      // Also update available brands to show all brands in filter
      setAvailableBrands(brandCache.data); 
      return;
    }
    
    try {
      const response = await getBrands(token);
      const brandList = response.results || response || [];
      
      // Update cache
      brandCache.data = brandList;
      brandCache.timestamp = Date.now();
      
      setAllBrands(brandList);
      // Also update available brands to show all brands in filter
      setAvailableBrands(brandList); 
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    }
  }, [getToken]);

  // Fetch all colors once with caching
  const fetchColors = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    
    // Check if we have valid cache
    if (colorCache.data && (Date.now() - colorCache.timestamp < CACHE_EXPIRY)) {
      // Add color codes to cached colors
      const enhancedColors = enhanceColorData(colorCache.data);
      setAvailableColors(enhancedColors);
      return;
    }
    
    try {
      const response = await getColors(token);
      const colorList = response.results || response || [];
      console.log('Colors from API:', colorList);
      
      // Add color codes to colors
      const enhancedColors = enhanceColorData(colorList);
      
      // Update cache with original data
      colorCache.data = colorList;
      colorCache.timestamp = Date.now();
      
      // Set state with enhanced data
      setAvailableColors(enhancedColors);
    } catch (err) {
      console.error('Failed to fetch colors:', err);
    }
  }, [getToken, enhanceColorData]);

  // Load brands and colors on component mount
  useEffect(() => {
    fetchBrands();
    fetchColors();
  }, [fetchBrands, fetchColors]);
  
  // Helper function for statistics only (not used for filters)
  const updateFilterOptions = useCallback((productList) => {
    // Extract unique brand IDs from products for statistics only
    const productBrandIds = [...new Set(productList.map(p => p.brand).filter(Boolean))];
    
    // Extract unique colors from products for statistics only
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
    
    // Just logging for debug
    console.log(`Products with ${productBrandIds.length} brands and ${colorsMap.size} colors found`);
  }, []);

  // Request tracker to prevent duplicate requests
  const requestRef = useRef({ inProgress: false, params: null });
  
  // Track previous filter state to detect changes including clearing filters
  const prevFiltersRef = useRef({ brandIds: [], colorIds: [] });
  
  // Fetch products with pagination and caching
  const fetchProducts = useCallback(async (page = 1, resetFilters = false) => {
    const token = getToken();
    if (!token) return;

    // Build params object
    const params = { page_size: PAGE_SIZE, page };
    if (searchQuery) params.q = searchQuery;
    if (subcategoryId) params.scategory = subcategoryId;
    
    // Only add filter params if not resetting AND we have selected filters
    if (!resetFilters) {
      if (selectedBrandIds.length > 0) {
        params.brand = selectedBrandIds.join(',');
      }
      if (selectedColorIds.length > 0) {
        params.color = selectedColorIds.join(',');
      }
    }
    
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
        setTotalCount(meta.count || cachedData.data.length);
        setHasNextPage(!!meta.next);
        setHasPrevPage(!!meta.previous);
        setCurrentPage(page);
        
        // Extract filter options if needed
        if (page === 1 && resetFilters) {
          updateFilterOptions(cachedData.data);
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
      const meta = response || {};
      
      // Update cache
      productCache.set(cacheKey, {
        data: productList,
        meta,
        timestamp: Date.now()
      });
      
      setProducts(productList);
      
      // Update pagination state
      setTotalCount(meta.count || productList.length);
      setHasNextPage(!!meta.next);
      setHasPrevPage(!!meta.previous);
      setCurrentPage(page);

      // We still call updateFilterOptions but only for statistics
      if (page === 1 && resetFilters) {
        updateFilterOptions(productList);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
      requestRef.current.inProgress = false;
    }
  }, [getToken, searchQuery, subcategoryId, selectedBrandIds, selectedColorIds]);


  // Fetch initial products when component mounts or searchQuery/subcategoryId changes
  useEffect(() => {
    // Reset filter selections when search query or subcategory changes
    setSelectedBrandIds([]);
    setSelectedColorIds([]);
    fetchProducts(1, true);
  }, [searchQuery, subcategoryId]);

  // Fetch filtered products when filters change
  useEffect(() => {
    // Check if filters have actually changed from previous state
    const prevBrandIds = prevFiltersRef.current.brandIds;
    const prevColorIds = prevFiltersRef.current.colorIds;
    
    const brandsChanged = JSON.stringify(prevBrandIds.sort()) !== JSON.stringify([...selectedBrandIds].sort());
    const colorsChanged = JSON.stringify(prevColorIds.sort()) !== JSON.stringify([...selectedColorIds].sort());
    
    // If filters changed and we're not on initial mount (prev filters exist)
    if ((brandsChanged || colorsChanged) && (prevBrandIds.length > 0 || prevColorIds.length > 0 || selectedBrandIds.length > 0 || selectedColorIds.length > 0)) {
      setCurrentPage(1);
      fetchProducts(1, false);
    }
    
    // Update previous filter state
    prevFiltersRef.current = {
      brandIds: [...selectedBrandIds],
      colorIds: [...selectedColorIds]
    };
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
    // Clear selected filters
    setSelectedBrandIds([]);
    setSelectedColorIds([]);
    // Reset current page and fetch products without filters
    setCurrentPage(1);
    // Force reload products with cleared filters (true flag ensures filter params are not added)
    fetchProducts(1, true);
    console.log('Filters cleared, reloading all products');
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

  // Handle image click
  const handleImageClick = useCallback((e, product) => {
    e.stopPropagation();
    const imageUrl = getProductImage(product);
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setSelectedProductTitle(product.title);
      setIsImageModalOpen(true);
    }
  }, []);

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
                  <div 
                    className="w-16 h-16 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                    onClick={(e) => handleImageClick(e, product)}
                  >
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
                      <div>
                        <p className="text-xs text-gray-500 mt-1">کد: {product.code}</p>
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">رنگ:</span>
                            <div className="flex items-center gap-1">
                              {product.colors.map((color, colorIndex) => (
                                <div key={`${product.id}-color-${color.id}-${colorIndex}`} className="flex items-center gap-1">
                                  {color.color_code && (
                                    <div 
                                      className="w-3 h-3 rounded-full border border-gray-300" 
                                      style={{ backgroundColor: color.color_code }}
                                    ></div>
                                  )}
                                  <span className="text-xs text-gray-500">{color.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <FaChevronLeft className="text-gray-400 shrink-0" />
                </div>
              ))}
              
              {/* Mobile Pagination */}
              {totalCount > PAGE_SIZE && (
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
                      {filteredBrands.map((brand, index) => (
                        <label key={`brand-${brand.id}-${index}`} className="flex items-center gap-3 cursor-pointer">
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
                    {availableColors.map((color, index) => (
                      <label key={`color-${color.id}-${index}`} className="flex items-center gap-3 cursor-pointer">
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
                    <div 
                      className="w-28 h-28 shrink-0 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                      onClick={(e) => handleImageClick(e, product)}
                    >
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
                      <div>
                        {product.code && (
                          <p className="text-sm text-gray-500 mt-1">کد محصول: {product.code}</p>
                        )}
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center flex-wrap gap-2 mt-2">
                            <span className="text-sm text-gray-500">رنگ:</span>
                            <div className="flex items-center flex-wrap gap-2">
                              {product.colors.map((color, colorIndex) => (
                                <div key={`${product.id}-color-${color.id}-${colorIndex}`} className="flex items-center gap-1">
                                  {color.color_code && (
                                    <div 
                                      className="w-4 h-4 rounded-full border border-gray-300" 
                                      style={{ backgroundColor: color.color_code }}
                                    ></div>
                                  )}
                                  <span className="text-sm text-gray-500">{color.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <FaChevronLeft className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                ))
              )}
            </div>
            
            {/* Desktop Pagination */}
            {totalCount > PAGE_SIZE && !loading && (
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
                      {filteredBrands.map((brand, index) => (
                        <label key={`desktop-brand-${brand.id}-${index}`} className="flex items-center gap-3 cursor-pointer group">
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
                    {availableColors.map((color, index) => (
                      <label key={`desktop-color-${color.id}-${index}`} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedColorIds.includes(color.id)}
                          onChange={() => toggleColor(color.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300" 
                            style={{ backgroundColor: color.color_code || getDefaultColorCode(color.name) }}
                          ></div>
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">{color.name}</span>
                        </div>
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
      
      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImage}
        productTitle={selectedProductTitle}
      />
    </div>
  );
};

export default ProductListPage;
