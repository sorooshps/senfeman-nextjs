"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import apiConfig from "../../../config/api.config";
import { FaChevronLeft, FaChevronDown, FaChevronUp, FaFilter } from "react-icons/fa6";
import { IoIosArrowBack, IoIosClose } from "react-icons/io";
import logo from "../../../assets/fonts/LOGO_SVG.svg";
import { useAuth } from "../../../hooks/useAuth";
import { searchProducts, getBrands, getColors } from "../../../api/seller";

const PAGE_SIZE = 20;
const API_BASE_URL = apiConfig.API_BASE_URL;

const CategoriesSection = ({ 
  activeCategory, 
  onCategoryClick, 
  categories = [],
  subcategories = [],
  loadingCategories = false,
  onProductSelect
}) => {
  const { getToken } = useAuth('seller', { skipRoleRedirect: true });
  
  // State for selected subcategory and products view
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  
  // Filter states - store as objects {id, name}
  const [allBrands, setAllBrands] = useState([]); // All brands from API
  const [availableBrands, setAvailableBrands] = useState([]); // Brands that have products in this subcategory
  const [availableColors, setAvailableColors] = useState([]); // Colors from products
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [selectedColorIds, setSelectedColorIds] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [expandedFilters, setExpandedFilters] = useState({ brand: true, color: true });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Reset when category changes
  useEffect(() => {
    setSelectedSubcategory(null);
    setProducts([]);
    setSelectedBrandIds([]);
    setSelectedColorIds([]);
    setAvailableBrands([]);
    setAvailableColors([]);
    setCurrentPage(1);
    setTotalCount(0);
  }, [activeCategory]);

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

  // Fetch all brands once
  useEffect(() => {
    const fetchBrands = async () => {
      const token = getToken();
      if (!token) return;
      
      try {
        const response = await getBrands(token);
        const brandList = response.results || response || [];
        setAllBrands(brandList);
        // Also update available brands to show all brands in filter
        setAvailableBrands(brandList);
      } catch (err) {
        console.error('Failed to fetch brands:', err);
      }
    };
    
    fetchBrands();
  }, [getToken]);

  // Fetch all colors at once
  useEffect(() => {
    const fetchColors = async () => {
      const token = getToken();
      if (!token) return;
      
      try {
        const response = await getColors(token);
        const colorList = response.results || response || [];
        console.log('Raw colors from API:', colorList);
        
        // Enhance colors with default color codes
        const enhancedColors = enhanceColorData(colorList);
        setAvailableColors(enhancedColors);
      } catch (err) {
        console.error('Failed to fetch colors:', err);
      }
    };
    
    fetchColors();
  }, [getToken, enhanceColorData]);

  // Fetch products with pagination
  const fetchProducts = async (page = 1, extractFilters = false) => {
    if (!selectedSubcategory) return;
    
    const token = getToken();
    if (!token) return;

    setLoadingProducts(true);
    try {
      const params = {
        scategory: selectedSubcategory.id,
        page_size: PAGE_SIZE,
        page
      };
      
      // Only add filter params if not extracting filters AND we have selected filters
      if (!extractFilters && selectedBrandIds.length > 0) {
        params.brand = selectedBrandIds.join(',');
      }
      if (!extractFilters && selectedColorIds.length > 0) {
        params.color = selectedColorIds.join(',');
      }

      const response = await searchProducts(params, token);
      const productList = response.results || response || [];
      setProducts(productList);
      
      // Update pagination state
      setTotalCount(response.count || productList.length);
      setHasNextPage(!!response.next);
      setHasPrevPage(!!response.previous);
      setCurrentPage(page);

      // We no longer need to extract filter options from products
      // since we already have all brands and colors loaded separately
      if (extractFilters && page === 1) {
        // We can still log statistics for debugging if needed
        const productBrandIds = [...new Set(productList.map(p => p.brand).filter(Boolean))];
        const productColorIds = new Set();
        productList.forEach(p => {
          if (p.colors && Array.isArray(p.colors)) {
            p.colors.forEach(c => {
              if (c.id) productColorIds.add(c.id);
            });
          }
        });
        console.log(`Products in this category have ${productBrandIds.length} unique brands and ${productColorIds.size} unique colors`);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch products when subcategory is selected
  useEffect(() => {
    if (selectedSubcategory) {
      // Reset any active filters when subcategory changes
      setSelectedBrandIds([]);
      setSelectedColorIds([]);
      setCurrentPage(1);
      fetchProducts(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubcategory, allBrands]);

  // Fetch filtered products when filters change
  useEffect(() => {
    if (selectedSubcategory && (selectedBrandIds.length > 0 || selectedColorIds.length > 0)) {
      setCurrentPage(1);
      fetchProducts(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandIds, selectedColorIds]);

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

  const handleSubcategoryClick = (subcat) => {
    setSelectedSubcategory(subcat);
    setSelectedBrandIds([]);
    setSelectedColorIds([]);
  };

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null);
    setProducts([]);
    setSelectedBrandIds([]);
    setSelectedColorIds([]);
  };

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
    setCurrentPage(1);
    // Explicitly call with resetFilters=true to avoid using filter params
    fetchProducts(1, true);
    console.log('Filters cleared, reloading all products for selected subcategory');
  };

  const filteredBrands = availableBrands.filter(brand => 
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const hasActiveFilters = selectedBrandIds.length > 0 || selectedColorIds.length > 0;

  // Get subcategory image
  const getSubcategoryImage = (subcat) => {
    if (subcat?.image) return subcat.image;
    return null;
  };

  // Get product image with proper URL formatting
  const getProductImage = (product) => {
    if (product?.images && product.images.length > 0) {
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
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-4">
        
        {/* Sidebar - Categories or Filters */}
        <div className="lg:col-span-1 relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"></div>
          <div className="sticky top-8">
            {selectedSubcategory ? (
              // Filter Sidebar
              <div>
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
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {filteredBrands.length > 0 ? (
                          filteredBrands.map((brand) => (
                            <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedBrandIds.includes(brand.id)}
                                onChange={() => toggleBrand(brand.id)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 group-hover:text-gray-900">{brand.name}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400">برندی یافت نشد</p>
                        )}
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
                    <div className="px-5 pb-4 space-y-3 max-h-48 overflow-y-auto">
                      {availableColors.length > 0 ? (
                        availableColors.map((color) => (
                          <label key={color.id} className="flex items-center gap-3 cursor-pointer group">
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
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">رنگی یافت نشد</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Categories Sidebar
              <div className="p-6">
                {loadingCategories ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category, index) => (
                      <button
                        key={category.id || index}
                        onClick={() => onCategoryClick(index)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                          activeCategory === index 
                            ? `bg-gray-200 shadow-md`
                            : 'bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-medium text-right ${
                            activeCategory === index ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {category.name}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          activeCategory === index ? 'text-black' : 'text-gray-400'
                        }`}>
                          <FaChevronLeft className="text-sm" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Subcategories or Products */}
        <div className="lg:col-span-3">
          <div className="p-8">
            {selectedSubcategory ? (
              // Products View
              <>
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleBackToSubcategories}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <IoIosArrowBack size={20} className="text-gray-600" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedSubcategory.name}
                      </h2>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{totalCount} محصول یافت شد</span>
                </div>

                {/* Products List */}
                {loadingProducts ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">محصولی یافت نشد</div>
                ) : (
                  <>
                    <div className="divide-y divide-gray-100">
                      {products.map((product, index) => (
                        <div
                          key={product.id || index}
                          onClick={() => onProductSelect && onProductSelect(product)}
                          className="py-4 flex items-center gap-6 cursor-pointer hover:bg-gray-50 transition-colors group px-2 -mx-2 rounded-lg"
                        >
                          <div className="w-20 h-20 shrink-0 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                            {getProductImage(product) ? (
                              <Image 
                                src={getProductImage(product)} 
                                alt={product.title} 
                                width={80} 
                                height={80}
                                className="w-full h-full object-contain"
                                unoptimized={getProductImage(product)?.includes('http')}
                              />
                            ) : (
                              <Image 
                                src={logo} 
                                alt={product.title} 
                                width={56} 
                                height={56} 
                              />
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
                                    {product.colors.map(color => (
                                      <div key={color.id} className="flex items-center gap-1">
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
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalCount > PAGE_SIZE && (
                      <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
                        <button
                          onClick={goToPrevPage}
                          disabled={!hasPrevPage}
                          className={`px-5 py-2 rounded-lg text-sm font-medium ${
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
                          className={`px-5 py-2 rounded-lg text-sm font-medium ${
                            hasNextPage 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          صفحه بعد
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              // Subcategories View
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {categories[activeCategory]?.name || 'دسته‌بندی'}
                    </h2>
                    <p className="text-gray-500 mt-2">
                      زیردسته مورد نظر را انتخاب کنید
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {subcategories.length} زیردسته
                    </span>
                  </div>
                </div>

                {/* Subcategories Grid with Images */}
                {subcategories.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {subcategories.map((subcat, index) => (
                      <button
                        key={subcat.id || index}
                        onClick={() => handleSubcategoryClick(subcat)}
                        className="group p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all flex flex-col items-center gap-3"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                          {getSubcategoryImage(subcat) ? (
                            <Image 
                              src={getSubcategoryImage(subcat)} 
                              alt={subcat.name} 
                              width={64} 
                              height={64}
                              className="w-full h-full object-contain"
                              unoptimized={typeof getSubcategoryImage(subcat) === 'string' && getSubcategoryImage(subcat)?.includes('http')}
                            />
                          ) : (
                            <Image src={logo} alt={subcat.name} width={40} height={40} />
                          )}
                        </div>
                        <span className="font-medium text-gray-800 text-sm text-center">{subcat.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    زیردسته‌ای برای این دسته وجود ندارد
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesSection;
