"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  searchProducts,
  getRecentSearches,
  saveRecentSearch,
  deleteRecentSearch,
  clearRecentSearches,
  getCategories
} from "../../../api/seller";

// Cache for subcategories to avoid redundant API calls
let subcategoriesCache = null;
let lastFetchTime = 0;
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useSearch = () => {
  const { getToken } = useAuth('seller', { skipRoleRedirect: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Fetch all subcategories from all categories with caching
  const fetchAllSubcategories = useCallback(async () => {
    const token = getToken();
    if (!token) return [];
    
    // Check if we have a valid cache
    const now = Date.now();
    if (subcategoriesCache && (now - lastFetchTime < CACHE_EXPIRY_TIME)) {
      return subcategoriesCache;
    }
    
    try {
      const response = await getCategories(token);
      const categories = response.results || response || [];
      
      // Extract all subcategories from all categories
      let allSubcategories = [];
      categories.forEach(category => {
        const subcategories = category.subCategories || [];
        allSubcategories = [
          ...allSubcategories,
          ...subcategories.map(subcat => ({
            id: subcat.id,
            title: subcat.name,
            categoryId: category.id,
            categoryName: category.name,
            type: 'subcategory'
          }))
        ];
      });
      
      // Update cache
      subcategoriesCache = allSubcategories;
      lastFetchTime = now;
      
      return allSubcategories;
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      return subcategoriesCache || [];
    }
  }, [getToken]);

  // Debounce function for search
  const debounce = (func, delay) => {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Debounced search reference
  const debouncedFetchRef = useRef(null);

  // Initialize debounced search function
  useEffect(() => {
    debouncedFetchRef.current = debounce(async (query) => {
      if (!query.trim() || query.length < 2) {
        setSearchSuggestions([]);
        return;
      }

      try {
        // Get all subcategories (from cache if available)
        const allSubcategories = await fetchAllSubcategories();
        
        // Filter subcategories based on search query
        const filteredSubcategories = allSubcategories.filter(subcat => 
          subcat.title.toLowerCase().includes(query.toLowerCase())
        );
        
        // Update search suggestions with matching subcategories
        setSearchSuggestions(filteredSubcategories);
      } catch (err) {
        console.error('Error in search suggestions:', err);
        setSearchSuggestions([]);
      }
    }, 300); // 300ms debounce time
  }, [fetchAllSubcategories]);

  // Fetch and filter subcategories for search suggestions with debouncing
  const fetchSuggestions = useCallback((query) => {
    if (debouncedFetchRef.current) {
      debouncedFetchRef.current(query);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    const token = getToken();
    if (!token) return;

    setLoadingSearch(true);
    try {
      const response = await searchProducts({ q: searchQuery.trim(), page_size: 20 }, token);
      const products = response.results || response || [];
      setSearchResults(products);
      
      if (products.length > 0) {
        // Select first product by default
        const firstProduct = products[0];
        setSelectedProduct(firstProduct);
        
        // Save to recent searches
        const searchItem = {
          id: firstProduct.id,
          title: firstProduct.title,
          query: searchQuery.trim(),
          timestamp: Date.now()
        };
        saveRecentSearch(searchItem);
        setRecentSearches(getRecentSearches());
      }
      
      setHasSearched(true);
      setIsSearchModalOpen(false);
      setShowSearchHistory(false);
      setSearchSuggestions([]);
    } catch {
      // Silent error
    } finally {
      setLoadingSearch(false);
    }
  }, [getToken, searchQuery]);

  const handleRecentSearchClick = useCallback((recentItem) => {
    // recentItem can be an object with id/title or just a string
    if (typeof recentItem === 'object' && recentItem.title) {
      setSearchQuery(recentItem.title);
    } else {
      setSearchQuery(recentItem);
    }
    setHasSearched(true);
    setIsSearchModalOpen(false);
    setShowSearchHistory(false);
    setSearchSuggestions([]);
  }, []);

  const handleSuggestionClick = useCallback(async (suggestion) => {
    // suggestion is now a subcategory object
    setSearchQuery(suggestion.title);
    
    // Save to recent searches
    const searchItem = {
      id: suggestion.id,
      title: suggestion.title,
      query: suggestion.title,
      timestamp: Date.now(),
      type: 'subcategory',
      categoryId: suggestion.categoryId,
      categoryName: suggestion.categoryName
    };
    saveRecentSearch(searchItem);
    setRecentSearches(getRecentSearches());
    
    // For subcategory, search for products in that subcategory
    const token = getToken();
    if (token) {
      setLoadingSearch(true);
      try {
        const response = await searchProducts({ scategory: suggestion.id, page_size: 20 }, token);
        const products = response.results || response || [];
        
        if (products.length > 0) {
          setSelectedProduct(products[0]);
        }
        
        setSearchResults(products);
      } catch (err) {
        console.error('Error fetching subcategory products:', err);
      } finally {
        setLoadingSearch(false);
      }
    }
    
    setHasSearched(true);
    setIsSearchModalOpen(false);
    setShowSearchHistory(false);
    setSearchSuggestions([]);
  }, [getToken]);

  const handleSearchInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
  }, [fetchSuggestions]);

  const handleSearchInputClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleSearchInputFocus = () => {
    setShowSearchHistory(true);
  };

  const handleSearchInputBlur = () => {
    setTimeout(() => {
      setShowSearchHistory(false);
    }, 200);
  };

  const handleDeleteSearch = useCallback((index) => {
    const searches = getRecentSearches();
    if (searches[index]) {
      deleteRecentSearch(searches[index].id);
      setRecentSearches(getRecentSearches());
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    hasSearched,
    setHasSearched,
    showSearchHistory,
    setShowSearchHistory,
    searchSuggestions,
    setSearchSuggestions,
    isSearchModalOpen,
    setIsSearchModalOpen,
    recentSearches,
    selectedProduct,
    setSelectedProduct,
    searchResults,
    loadingSearch,
    handleSearch,
    handleRecentSearchClick,
    handleSuggestionClick,
    handleSearchInputChange,
    handleSearchInputClick,
    handleSearchInputFocus,
    handleSearchInputBlur,
    handleDeleteSearch,
    handleClearHistory
  };
};