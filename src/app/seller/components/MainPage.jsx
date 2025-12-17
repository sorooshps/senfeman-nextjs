"use client";

import { useState, useEffect } from "react";
import HeaderSection from "./HeaderSection";
import SellerNavbar from "./SellerNavbar";
import SearchSection from "./SearchSection";
import CategoriesSection from "./CategoriesSection";
import SearchResultsPage from "./SearchResultsPage";
import ProductListPage from "./ProductListPage";
import MobileCategoriesPage from "./MobileCategoriesPage";
import SearchModal from "./SearchModal";
import { useSearch } from "../hooks/useSearch";
import { useCategories } from "../hooks/useCategories";
import { FaList } from "react-icons/fa6";
import { saveRecentSearch, getRecentSearches } from "../../../api/seller";
import { useRouter } from "next/navigation";

export default function MainPage({ initialShowCategories = false }) {
  // Local states for UI controls
  const [showDetails, setShowDetails] = useState(true);
  const [showMore, setShowMore] = useState(false);
  
  // New states for flow control
  const [showProductList, setShowProductList] = useState(false);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);

  const router = useRouter();

  const {
    searchQuery,
    setSearchQuery,
    hasSearched,
    setHasSearched,
    showSearchHistory,
    searchSuggestions,
    isSearchModalOpen,
    setIsSearchModalOpen,
    recentSearches,
    selectedProduct,
    setSelectedProduct,
    handleSearch: originalHandleSearch,
    handleRecentSearchClick,
    handleSuggestionClick,
    handleSearchInputChange,
    handleSearchInputClick,
    handleSearchInputFocus,
    handleSearchInputBlur,
    handleDeleteSearch,
    handleClearHistory
  } = useSearch();

  const {
    showCategories,
    setShowCategories,
    activeCategory,
    showProducts,
    categories,
    subcategories,
    loadingCategories,
    handleCategoryClick,
    handleBackToCategories,
    handleShowCategories,
    handleBackToMain,
    handleDesktopCategoryClick
  } = useCategories(setHasSearched, setSearchQuery, setSelectedProduct, initialShowCategories);

  // Force show categories when initialShowCategories is true
  useEffect(() => {
    if (initialShowCategories) {
      setShowCategories(true);
    }
  }, [initialShowCategories, setShowCategories]);

  // Modified search handler - shows product list first
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowProductList(true);
      setCurrentSubcategory(null);
      setIsSearchModalOpen(false);
    }
  };

  // Handle product selection from product list
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearchQuery(product.title);
    
    // Save to recent searches
    const searchItem = {
      id: product.id,
      title: product.title,
      query: product.title,
      timestamp: Date.now()
    };
    saveRecentSearch(searchItem);
    
    setShowProductList(false);
    setHasSearched(true);
  };

  // Handle back from product list
  const handleBackFromProductList = () => {
    setShowProductList(false);
    setCurrentSubcategory(null);
  };

  // Handle back from search results
  const handleBackFromResults = () => {
    setHasSearched(false);
    setSelectedProduct(null);
    setSearchQuery('');
  };

  // Handle mobile subcategory click - show product list
  const handleMobileSubcategoryClick = (subcat) => {
    setCurrentSubcategory(subcat);
    setShowProductList(true);
    setShowCategories(false);
  };

  // Show product list page (after search or subcategory click)
  if (showProductList) {
    return (
      <ProductListPage
        searchQuery={currentSubcategory ? null : searchQuery}
        subcategoryId={currentSubcategory?.id}
        subcategoryName={currentSubcategory?.name}
        onBack={handleBackFromProductList}
        onProductSelect={handleProductSelect}
      />
    );
  }

  // If user has selected a product, show search results (wholesalers)
  if (hasSearched && selectedProduct) {
    return (
      <SearchResultsPage
        searchQuery={searchQuery}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        recentSearches={recentSearches}
        showMore={showMore}
        setShowMore={setShowMore}
        handleSearch={handleSearch}
        handleSearchInputChange={handleSearchInputChange}
        handleSearchInputClick={handleSearchInputClick}
        handleDeleteSearch={handleDeleteSearch}
        handleClearHistory={handleClearHistory}
        handleRecentSearchClick={handleRecentSearchClick}
        selectedProduct={selectedProduct}
        onBack={handleBackFromResults}
      />
    );
  }

  // Mobile Categories View
  if (showCategories) {
    return (
      <MobileCategoriesPage
        activeCategory={activeCategory}
        showProducts={showProducts}
        categories={categories}
        subcategories={subcategories}
        loadingCategories={loadingCategories}
        handleCategoryClick={handleCategoryClick}
        handleBackToCategories={handleBackToCategories}
        handleBackToMain={handleBackToMain}
        handleSubcategoryClick={handleMobileSubcategoryClick}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-gray-50" dir="rtl">
      <SellerNavbar />
      
      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen pt-8 px-4 pb-20">
        <HeaderSection />
        <SearchSection 
          onSearchInputClick={handleSearchInputClick}
          mobile={true}
        />
        <div className="fixed bottom-20 left-4 right-4">
          <button
            onClick={handleShowCategories}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-3 shadow-lg"
          >
            <FaList className="text-lg" />
            مشاهده دسته‌بندی‌ها
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 py-8">
        <HeaderSection />
        <SearchSection
          searchQuery={searchQuery}
          onSearchInputChange={handleSearchInputChange}
          onSearchInputFocus={handleSearchInputFocus}
          onSearchInputBlur={handleSearchInputBlur}
          onSearch={handleSearch}
          showSearchHistory={showSearchHistory}
          searchSuggestions={searchSuggestions}
          recentSearches={recentSearches}
          showMore={showMore}
          onSuggestionClick={(suggestion) => {
            // For subcategory suggestions
            setSearchQuery(suggestion.title);
            
            // Set the subcategory directly
            const subcategory = {
              id: suggestion.id,
              name: suggestion.title,
              categoryId: suggestion.categoryId,
              categoryName: suggestion.categoryName
            };
            
            setCurrentSubcategory(subcategory);
            setShowProductList(true);
          }}
          onRecentSearchClick={(item) => {
            const query = typeof item === 'object' ? (item.title || item.query) : item;
            setSearchQuery(query);
            setShowProductList(true);
            setCurrentSubcategory(null);
          }}
          onDeleteSearch={handleDeleteSearch}
          onClearHistory={handleClearHistory}
          onShowMoreToggle={() => setShowMore(!showMore)}
          mobile={false}
        />
        <CategoriesSection
          activeCategory={activeCategory}
          onCategoryClick={handleDesktopCategoryClick}
          categories={categories}
          subcategories={subcategories}
          loadingCategories={loadingCategories}
          onProductSelect={handleProductSelect}
        />
      </div>

      {/* Search Modal for Mobile */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchQuery={searchQuery}
        onSearchInputChange={handleSearchInputChange}
        onSearch={handleSearch}
        searchSuggestions={searchSuggestions}
        onSuggestionClick={(suggestion) => {
          // For subcategory suggestions
          setSearchQuery(suggestion.title);
          
          // Set the subcategory directly
          const subcategory = {
            id: suggestion.id,
            name: suggestion.title,
            categoryId: suggestion.categoryId,
            categoryName: suggestion.categoryName
          };
          
          setCurrentSubcategory(subcategory);
          setShowProductList(true);
          setIsSearchModalOpen(false);
        }}
        recentSearches={recentSearches}
        onRecentSearchClick={(item) => {
          const query = typeof item === 'object' ? (item.title || item.query) : item;
          setSearchQuery(query);
          setShowProductList(true);
          setCurrentSubcategory(null);
          setIsSearchModalOpen(false);
        }}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}