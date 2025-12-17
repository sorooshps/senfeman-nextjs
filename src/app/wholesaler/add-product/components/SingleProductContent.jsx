'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaMinus, FaArrowRight, FaCheck, FaFilter, FaTimes, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { useAuth } from '../../../../hooks/useAuth';
import { 
  searchProducts, 
  getCategories, 
  getBrandsBySubcategory, 
  addWholesalerProduct 
} from '../../../../api/wholesaler';

const SingleProductContent = () => {
  const { getToken } = useAuth('wholesaler');
  
  // ===== SEARCH SECTION STATES =====
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchTotalCount, setSearchTotalCount] = useState(0);
  
  // ===== CATEGORY SECTION STATES =====
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryStep, setCategoryStep] = useState('category'); // 'category' | 'subcategory' | 'products'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  
  // Category Products List states
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [categoryBrands, setCategoryBrands] = useState([]);
  const [categoryColors, setCategoryColors] = useState([]);
  const [loadingCategoryProducts, setLoadingCategoryProducts] = useState(false);
  const [loadingCategoryBrands, setLoadingCategoryBrands] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [categoryTotalCount, setCategoryTotalCount] = useState(0);
  
  // Filters for category products
  const [filterBrand, setFilterBrand] = useState(null);
  const [filterColor, setFilterColor] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [allCategoryProducts, setAllCategoryProducts] = useState([]);
  
  // ===== SHARED STATES =====
  const [selectedProducts, setSelectedProducts] = useState({}); // { productId: { product, stock } }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ===== FETCH CATEGORIES ON MOUNT =====
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getCategories(token);
        setCategories(response.results || response || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [getToken]);

  // ===== SEARCH HANDLER (uses q param for product name search) =====
  const handleSearch = useCallback(async (page = 1) => {
    const token = getToken();
    if (!token || !searchQuery.trim()) return;

    setLoadingSearch(true);
    setError(null);
    try {
      // Use the correct endpoint path
      const response = await searchProducts({ q: searchQuery.trim(), page, page_size: 10 }, token);
      setSearchResults(response.results || response || []);
      setSearchPage(page);
      if (response.count) {
        setSearchTotalCount(response.count);
        setSearchTotalPages(Math.ceil(response.count / 10));
      }
    } catch (err) {
      console.error('Failed to search products:', err);
      setError('خطا در جستجوی محصولات');
      setSearchResults([]); // Clear results on error
    } finally {
      setLoadingSearch(false);
    }
  }, [getToken, searchQuery]);

  // ===== CATEGORY SELECTION =====
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setCategoryProducts([]);
    setCategoryBrands([]);
    setCategoryColors([]);
    setFilterBrand(null);
    setFilterColor(null);
    setCategoryStep('subcategory');
  };

  // ===== SUBCATEGORY SELECTION =====
  const handleSubcategorySelect = async (subcategory) => {
    setSelectedSubcategory(subcategory);
    setCategoryStep('products');
    
    const token = getToken();
    if (!token) return;

    // Fetch brands for this subcategory
    setLoadingCategoryBrands(true);
    try {
      const brandsResponse = await getBrandsBySubcategory(subcategory.id, token);
      setCategoryBrands(brandsResponse.results || brandsResponse || []);
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    } finally {
      setLoadingCategoryBrands(false);
    }

    // Fetch products for this subcategory
    await fetchCategoryProducts(subcategory.id, null, null, 1);
  };

  // ===== FETCH CATEGORY PRODUCTS =====
  const fetchCategoryProducts = async (subcategoryId, brandId, colorId, page = 1) => {
    const token = getToken();
    if (!token) return;

    setLoadingCategoryProducts(true);
    try {
      const params = { scategory: subcategoryId, page, page_size: 10 };
      if (brandId) params.brand = brandId;
      if (colorId) params.color = colorId;

      const response = await searchProducts(params, token);
      const products = response.results || response || [];
      
      // Store all products for filtering
      setAllCategoryProducts(products);
      setCategoryProducts(products);
      setCategoryPage(page);
      if (response.count) {
        setCategoryTotalCount(response.count);
        setCategoryTotalPages(Math.ceil(response.count / 10));
      }

      // Extract unique colors from products (only on first load without color filter)
      if (!colorId) {
        const allColors = [];
        products.forEach(p => {
          (p.colors || []).forEach(c => {
            if (!allColors.find(ac => ac.id === c.id)) {
              allColors.push(c);
            }
          });
        });
        setCategoryColors(allColors);
      }
    } catch (err) {
      console.error('Failed to fetch category products:', err);
    } finally {
      setLoadingCategoryProducts(false);
    }
  };

  // ===== FILTER HANDLERS =====
  const handleBrandFilter = (brand) => {
    setFilterBrand(brand);
    // Don't fetch immediately when changing in modal - wait for apply
  };

  const handleColorFilter = (color) => {
    setFilterColor(color);
    // Don't fetch immediately when changing in modal - wait for apply
  };

  const applyFilters = () => {
    setCategoryPage(1); // Reset page when applying filters
    if (selectedSubcategory) {
      fetchCategoryProducts(selectedSubcategory.id, filterBrand?.id, filterColor?.id, 1);
    }
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilterBrand(null);
    setFilterColor(null);
    setCategoryPage(1); // Reset page when clearing filters
    if (selectedSubcategory) {
      fetchCategoryProducts(selectedSubcategory.id, null, null, 1);
    }
    setShowFilterModal(false);
  };

  // Pagination handlers
  const handleSearchPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= searchTotalPages) {
      handleSearch(newPage);
    }
  };

  const handleCategoryPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= categoryTotalPages && selectedSubcategory) {
      fetchCategoryProducts(selectedSubcategory.id, filterBrand?.id, filterColor?.id, newPage);
    }
  };

  // Count active filters
  const activeFilterCount = (filterBrand ? 1 : 0) + (filterColor ? 1 : 0);

  // ===== GO BACK IN CATEGORY STEPS =====
  const handleCategoryBack = () => {
    if (categoryStep === 'products') {
      setCategoryStep('subcategory');
      setCategoryProducts([]);
      setCategoryBrands([]);
      setCategoryColors([]);
      setFilterBrand(null);
      setFilterColor(null);
    } else if (categoryStep === 'subcategory') {
      setCategoryStep('category');
      setSelectedCategory(null);
    }
  };

  // ===== ADD PRODUCT TO SIDEBAR (for search table) =====
  const handleStockChange = (product, delta) => {
    setSelectedProducts(prev => {
      const existing = prev[product.id];
      const currentStock = existing?.stock || 0;
      const newStock = Math.max(0, currentStock + delta);
      
      if (newStock === 0) {
        const { [product.id]: removed, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [product.id]: { product, stock: newStock }
      };
    });
  };

  const handleStockInput = (product, value) => {
    const stock = parseInt(value) || 0;
    setSelectedProducts(prev => {
      if (stock === 0) {
        const { [product.id]: removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [product.id]: { product, stock }
      };
    });
  };

  // ===== ADD PRODUCT FROM CATEGORY LIST (with stock 1) =====
  const handleCategoryProductToggle = (product) => {
    setSelectedProducts(prev => {
      if (prev[product.id]) {
        const { [product.id]: removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [product.id]: { product, stock: 1 }
      };
    });
  };

  // ===== SUBMIT =====
  const handleSubmit = async () => {
    const token = getToken();
    if (!token) return;

    const productsToAdd = Object.values(selectedProducts).filter(p => p.stock > 0);
    if (productsToAdd.length === 0) {
      setError('لطفا حداقل یک محصول انتخاب کنید');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = productsToAdd.map(({ product, stock }) => {
        // Make colors optional - if the product has colors, use them; otherwise, don't include the colors property
        const productPayload = {
          product: product.id,
          stock: stock
        };
        
        // Only include colors if they exist and the array is not empty
        if (product.colors && product.colors.length > 0) {
          productPayload.colors = product.colors.map(c => c.id);
        }
        
        return productPayload;
      });

      await addWholesalerProduct(payload, token);
      
      setSuccess(`${productsToAdd.length} محصول با موفقیت اضافه شد`);
      setSelectedProducts({});
      setSearchResults([]);
      setCategoryProducts([]);
      setSearchQuery('');
    } catch (err) {
      console.error('Failed to add products:', err);
      setError(err.message || 'خطا در ثبت محصولات');
    } finally {
      setSubmitting(false);
    }
  };

  // Get subcategories
  const subcategories = selectedCategory?.subCategories || [];
  const selectedCount = Object.keys(selectedProducts).length;

  // Color dot mapping
  const colorDotMap = {
    'مشکی': 'bg-[#1E1E1E]',
    'قرمز': 'bg-[#FF4D4D]',
    'صورتی': 'bg-[#E94DFF]',
    'زرد': 'bg-[#FFC64D]',
    'سبز': 'bg-[#4DFF8E]',
    'سفید': 'bg-white border border-gray-400',
    'آبی': 'bg-[#4D9FFF]',
    'نقره‌ای': 'bg-[#C0C0C0]',
    'طلایی': 'bg-[#FFD700]',
  };

  const getColorDot = (colorName) => colorDotMap[colorName] || 'bg-gray-400';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        
        {/* ===== SEARCH SECTION ===== */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className='flex justify-between items-center mb-4'>
            <h2 className="text-lg font-semibold text-gray-800 border-r-4 py-1 border-blue-500 pr-2">
              جستجوی محصولات
            </h2>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
                placeholder="نام محصول را وارد کنید..."
                className="w-64 pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button onClick={() => handleSearch(1)}>
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search Results Table */}
          {loadingSearch ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="mr-3 text-gray-600 text-sm">در حال جستجو...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">نام محصول</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">دسته بندی</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">کد کالا</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">تعداد</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((product) => {
                    const selected = selectedProducts[product.id];
                    const stock = selected?.stock || 0;
                    
                    return (
                      <tr key={product.id} className={stock > 0 ? 'bg-blue-50' : ''}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-md bg-gray-100 ml-3"></div>
                            <span className="text-sm font-medium text-gray-900">{product.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {product.categories?.[0]?.name || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          #{product.code}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleStockChange(product, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                            >
                              <FaMinus className="w-2.5 h-2.5" />
                            </button>
                            <input
                              type="number"
                              value={stock}
                              onChange={(e) => handleStockInput(product, e.target.value)}
                              className="w-10 text-center border border-gray-300 rounded py-1 text-sm"
                              min="0"
                            />
                            <button
                              onClick={() => handleStockChange(product, 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                            >
                              <FaPlus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-between items-center py-4">
                <button
                  onClick={() => handleSearchPageChange(searchPage - 1)}
                  disabled={searchPage === 1}
                  className="text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                >
                  <FaAngleLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">{searchPage} از {searchTotalPages}</span>
                <button
                  onClick={() => handleSearchPageChange(searchPage + 1)}
                  disabled={searchPage === searchTotalPages}
                  className="text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                >
                  <FaAngleRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <p className="text-sm">نام محصول را جستجو کنید</p>
            </div>
          )}
        </div>

        {/* ===== CATEGORY SECTION (Step by Step) ===== */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 border-r-4 py-1 border-blue-500 pr-2">
              دسته بندی ها
            </h2>
            {categoryStep !== 'category' && (
              <button 
                onClick={handleCategoryBack}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <FaArrowRight />
                <span>بازگشت</span>
              </button>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Step 1: Categories */}
          {categoryStep === 'category' && (
            <>
              {loadingCategories ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedCategory?.id === category.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm text-gray-700">{category.name}</span>
                      <input
                        type="radio"
                        checked={selectedCategory?.id === category.id}
                        readOnly
                        className="w-4 h-4 text-blue-600"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step 2: Subcategories with Images */}
          {categoryStep === 'subcategory' && (
            <div>
              <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
                <h3 className="text-md font-medium text-gray-700">
                  انتخاب دسته‌بندی فرعی: <span className="text-blue-500">{selectedCategory?.name}</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {subcategories.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">زیردسته‌بندی یافت نشد</div>
                ) : (
                  subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => handleSubcategorySelect(sub)}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedSubcategory?.id === sub.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg mb-2"></div>
                      <span className="text-sm text-gray-700 text-center">{sub.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 3: Products List with Filters */}
          {categoryStep === 'products' && (
            <div>
              <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
                <h3 className="text-md font-medium text-gray-700">
                  محصولات: <span className="text-blue-500">{selectedSubcategory?.name}</span>
                </h3>
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Filter Button with Badge */}
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="relative flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  <FaFilter className="text-gray-400" />
                  <span>فیلتر</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Selected Filters Display */}
                {filterColor && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                    <div className={`w-4 h-4 rounded-full ${getColorDot(filterColor.name)}`}></div>
                    <span className="text-sm text-gray-700">{filterColor.name}</span>
                    <button onClick={() => handleColorFilter(null)} className="mr-1 text-gray-400 hover:text-gray-600">
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {filterBrand && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                    <span className="text-sm text-gray-700">{filterBrand.name}</span>
                    <button onClick={() => handleBrandFilter(null)} className="mr-1 text-gray-400 hover:text-gray-600">
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Filter Modal */}
              {showFilterModal && (
                <div className="fixed inset-0 bg-gradient-to-br from-gray-500/50 to-gray-700/50 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">فیلتر محصولات</h3>
                      <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-gray-600">
                        <FaTimes className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Color Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">رنگ</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setFilterColor(null)}
                          className={`px-3 py-1.5 text-sm rounded-lg border ${!filterColor ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        >
                          همه
                        </button>
                        {categoryColors.map(color => (
                          <button
                            key={color.id}
                            onClick={() => setFilterColor(color)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border ${filterColor?.id === color.id ? 'bg-blue-50 border-blue-500' : 'border-gray-300 hover:bg-gray-50'}`}
                          >
                            <div className={`w-4 h-4 rounded-full ${getColorDot(color.name)}`}></div>
                            <span>{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Brand Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">برند</label>
                      <select
                        value={filterBrand?.id || ''}
                        onChange={(e) => {
                          const brand = categoryBrands.find(b => b.id === parseInt(e.target.value));
                          setFilterBrand(brand || null);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">همه برندها</option>
                        {categoryBrands.map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={clearFilters}
                        className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                      >
                        پاک کردن
                      </button>
                      <button
                        onClick={applyFilters}
                        className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                      >
                        اعمال فیلتر
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Products List (Name + Image only) */}
              {loadingCategoryProducts ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : categoryProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">محصولی یافت نشد</div>
              ) : (
                <>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {categoryProducts.map(product => {
                      const isSelected = !!selectedProducts[product.id];
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleCategoryProductToggle(product)}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          }`}>
                            {isSelected && <FaCheck className="text-white text-xs" />}
                          </div>
                          <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                          <span className="text-sm text-gray-800">{product.title}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Category Pagination */}
                  <div className="flex justify-between items-center py-4 mt-2">
                    <button
                      onClick={() => handleCategoryPageChange(categoryPage - 1)}
                      disabled={categoryPage === 1}
                      className="text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                    >
                      <FaAngleLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-600">{categoryPage} از {categoryTotalPages}</span>
                    <button
                      onClick={() => handleCategoryPageChange(categoryPage + 1)}
                      disabled={categoryPage === categoryTotalPages}
                      className="text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                    >
                      <FaAngleRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== SIDEBAR ===== */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
          <div className='flex justify-between mb-4 border-b border-gray-200 pb-3'>
            <h2 className="text-lg font-semibold text-gray-800">
              لیست محصولات
            </h2>
            <span className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">{selectedCount}</span> محصول
            </span>
          </div>

          {/* Selected Products */}
          <div className="max-h-72 overflow-y-auto mb-4">
            {selectedCount > 0 ? (
              <div className="space-y-2">
                {Object.values(selectedProducts).map(({ product, stock }) => (
                  <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <span className="text-sm text-gray-700 truncate">{product.title}</span>
                    </div>
                    <span className="text-sm font-medium text-blue-600 mr-2 whitespace-nowrap">{stock} عدد</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">محصولی انتخاب نشده</p>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setSelectedProducts({})}
              className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              انصراف
            </button>
            <button 
              onClick={handleSubmit}
              disabled={submitting || selectedCount === 0}
              className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {submitting ? 'در حال ثبت...' : 'ثبت کالا'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductContent;