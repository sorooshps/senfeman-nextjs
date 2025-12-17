"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { getCategories, searchProducts, saveRecentSearch } from "../../../api/seller";

// Cache for categories data to avoid redundant API calls
let categoriesCache = null;
let lastFetchTime = 0;
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

export const useCategories = (setHasSearched, setSearchQuery, setSelectedProduct, initialShowCategories = false) => {
  const { getToken } = useAuth('seller', { skipRoleRedirect: true });
  const [showCategories, setShowCategories] = useState(initialShowCategories);
  const [activeCategory, setActiveCategory] = useState(0);
  const [showProducts, setShowProducts] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch categories with caching to avoid redundant API calls
  const fetchCategories = useCallback(async (forceRefresh = false) => {
    const token = getToken();
    if (!token) return;

    // Check cache validity if not forced refresh
    const now = Date.now();
    if (!forceRefresh && categoriesCache && (now - lastFetchTime < CACHE_EXPIRY_TIME)) {
      setCategories(categoriesCache);
      if (categoriesCache.length > 0 && !activeCategory) {
        setSubcategories(categoriesCache[0].subCategories || []);
      }
      return;
    }

    // Only set loading if we don't have cached data to show
    if (!categoriesCache) {
      setLoadingCategories(true);
    }
    
    try {
      const response = await getCategories(token);
      const cats = response.results || response || [];
      
      // Update cache
      categoriesCache = cats;
      lastFetchTime = now;
      
      setCategories(cats);
      if (cats.length > 0 && !activeCategory) {
        setSubcategories(cats[0].subCategories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // If we have cache, use it as fallback
      if (categoriesCache) {
        setCategories(categoriesCache);
      }
    } finally {
      setLoadingCategories(false);
    }
  }, [getToken, activeCategory]);

  // Load categories on mount with caching
  useEffect(() => {
    fetchCategories();
    
    // Set up periodic refresh in background
    const refreshInterval = setInterval(() => {
      fetchCategories(true);
    }, CACHE_EXPIRY_TIME);
    
    return () => clearInterval(refreshInterval);
  }, [fetchCategories]);

  // Product cache by subcategory
  const productCacheRef = useRef(new Map());
  
  // Fetch products when subcategory is selected with caching
  const fetchProductsBySubcategory = useCallback(async (subcategoryId) => {
    const token = getToken();
    if (!token) return;

    // Check if we have cached products for this subcategory
    if (productCacheRef.current.has(subcategoryId)) {
      const cachedData = productCacheRef.current.get(subcategoryId);
      const isCacheStale = Date.now() - cachedData.timestamp > CACHE_EXPIRY_TIME;
      
      // Use cache if it's still fresh
      if (!isCacheStale) {
        setCategoryProducts(cachedData.products);
        return;
      }
    }

    setLoadingProducts(true);
    try {
      const response = await searchProducts({ scategory: subcategoryId, page_size: 20 }, token);
      const products = response.results || response || [];
      
      // Cache the results
      productCacheRef.current.set(subcategoryId, {
        products,
        timestamp: Date.now()
      });
      
      setCategoryProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      // If we have cache for this subcategory, use as fallback even if stale
      if (productCacheRef.current.has(subcategoryId)) {
        setCategoryProducts(productCacheRef.current.get(subcategoryId).products);
      }
    } finally {
      setLoadingProducts(false);
    }
  }, [getToken]);

  const handleCategoryClick = (index) => {
    setActiveCategory(index);
    if (categories[index]) {
      setSubcategories(categories[index].subCategories || []);
    }
    setShowProducts(true);
  };

  const handleBackToCategories = () => {
    setShowProducts(false);
    setCategoryProducts([]);
  };

  const handleShowCategories = () => {
    setShowCategories(true);
    setShowProducts(false);
  };

  const handleBackToMain = () => {
    setShowCategories(false);
    setShowProducts(false);
    setCategoryProducts([]);
  };

  const handleProductClick = (product) => {
    if (setSearchQuery) setSearchQuery(product.title || product.name);
    if (setSelectedProduct) setSelectedProduct(product);
    
    // Save to recent searches
    const searchItem = {
      id: product.id,
      title: product.title || product.name,
      query: product.title || product.name,
      timestamp: Date.now()
    };
    saveRecentSearch(searchItem);
    
    if (setHasSearched) setHasSearched(true);
    setShowCategories(false);
    setShowProducts(false);
  };

  const handleDesktopCategoryClick = (index) => {
    setActiveCategory(index);
    if (categories[index]) {
      setSubcategories(categories[index].subCategories || []);
    }
  };

  const handleSubcategoryClick = (subcategory) => {
    fetchProductsBySubcategory(subcategory.id);
  };

  return {
    showCategories,
    setShowCategories,
    activeCategory,
    setActiveCategory,
    showProducts,
    setShowProducts,
    categories,
    subcategories,
    categoryProducts,
    loadingCategories,
    loadingProducts,
    handleCategoryClick,
    handleBackToCategories,
    handleShowCategories,
    handleBackToMain,
    handleProductClick,
    handleDesktopCategoryClick,
    handleSubcategoryClick,
    fetchProductsBySubcategory
  };
};