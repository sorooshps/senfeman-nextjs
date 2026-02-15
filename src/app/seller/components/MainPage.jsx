"use client";

import { useState, useEffect } from "react";
import HeaderSection from "./HeaderSection";
import SellerNavbar from "./SellerNavbar";
import SearchSection from "./SearchSection";
import CategoriesSection from "./CategoriesSection";
import SearchModal from "./SearchModal";
import { useSearch } from "../hooks/useSearch";
import { useCategories } from "../hooks/useCategories";
import { useRouter } from "next/navigation";

export default function MainPage({ initialShowCategories = false }) {
  const router = useRouter();

  const {
    searchQuery,
    setSearchQuery,
    showSearchHistory,
    searchSuggestions,
    isSearchModalOpen,
    setIsSearchModalOpen,
    recentSearches,
    handleSearchInputChange,
    handleSearchInputClick,
    handleSearchInputFocus,
    handleSearchInputBlur,
    handleDeleteSearch,
    handleClearHistory,
    handleRecentSearchClick,
    handleSuggestionClick
  } = useSearch();

  const {
    showCategories,
    setShowCategories,
    activeCategory,
    categories,
    subcategories,
    loadingCategories,
    handleCategoryClick,
    handleBackToCategories,
    handleShowCategories,
    handleBackToMain,
    handleDesktopCategoryClick
  } = useCategories(undefined, setSearchQuery, undefined, initialShowCategories);

  // Force show categories when initialShowCategories is true
  useEffect(() => {
    if (initialShowCategories) {
      // On mobile, navigate to categories page
      // On desktop, just show categories on main page
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        router.push('/seller/categories');
      } else {
        setShowCategories(true);
      }
    }
  }, [initialShowCategories, setShowCategories, router]);

  // Handle clear search query
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Modified search handler - navigates to products page
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/seller/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchModalOpen(false);
    }
  };

  // Handle view categories button click
  const handleViewCategories = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      // On mobile, navigate to categories page
      router.push('/seller/categories');
    } else {
      // On desktop, show categories on main page
      handleShowCategories();
    }
  };

  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
        
        {/* View Categories Button for Mobile */}
        {/* <div className="fixed bottom-20 left-4 right-4 z-10">
          <button
            onClick={handleViewCategories}
            className="w-full bg-gradient-to-l from-blue-600 to-blue-700 text-white py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-colors font-semibold flex items-center justify-center gap-3 shadow-lg"
          >
            <span>مشاهده دسته‌بندی‌ها</span>
          </button>
        </div> */}
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
          onClearSearch={handleClearSearch}
          showSearchHistory={showSearchHistory}
          searchSuggestions={searchSuggestions}
          recentSearches={recentSearches}
          showMore={false}
          onSuggestionClick={(suggestion) => {
            router.push(`/seller/products?subcategory=${suggestion.id}&subcategoryName=${encodeURIComponent(suggestion.title)}`);
          }}
          onRecentSearchClick={(item) => {
            const query = typeof item === 'object' ? (item.title || item.query) : item;
            router.push(`/seller/products?q=${encodeURIComponent(query)}`);
          }}
          onDeleteSearch={handleDeleteSearch}
          onClearHistory={handleClearHistory}
          onShowMoreToggle={() => {}}
          mobile={false}
        />
        <CategoriesSection
          activeCategory={activeCategory}
          onCategoryClick={handleDesktopCategoryClick}
          categories={categories}
          subcategories={subcategories}
          loadingCategories={loadingCategories}
          onProductSelect={(product) => {
            router.push(`/seller/products/${product.id}`);
          }}
        />
      </div>

      {/* Search Modal for Mobile */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchQuery={searchQuery}
        onSearchInputChange={handleSearchInputChange}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        searchSuggestions={searchSuggestions}
        onSuggestionClick={(suggestion) => {
          router.push(`/seller/products?subcategory=${suggestion.id}&subcategoryName=${encodeURIComponent(suggestion.title)}`);
          setIsSearchModalOpen(false);
        }}
        recentSearches={recentSearches}
        onRecentSearchClick={(item) => {
          const query = typeof item === 'object' ? (item.title || item.query) : item;
          router.push(`/seller/products?q=${encodeURIComponent(query)}`);
          setIsSearchModalOpen(false);
        }}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}




// "use client";

// import { useState, useEffect } from "react";
// import HeaderSection from "./HeaderSection";
// import SellerNavbar from "./SellerNavbar";
// import SearchSection from "./SearchSection";
// import CategoriesSection from "./CategoriesSection";
// import MobileCategoriesPage from "./MobileCategoriesPage";
// import SearchModal from "./SearchModal";
// import { useSearch } from "../hooks/useSearch";
// import { useCategories } from "../hooks/useCategories";
// import { useRouter } from "next/navigation";

// export default function MainPage({ initialShowCategories = false }) {
//   const router = useRouter();

//   const {
//     searchQuery,
//     setSearchQuery,
//     showSearchHistory,
//     searchSuggestions,
//     isSearchModalOpen,
//     setIsSearchModalOpen,
//     recentSearches,
//     handleSearchInputChange,
//     handleSearchInputClick,
//     handleSearchInputFocus,
//     handleSearchInputBlur,
//     handleDeleteSearch,
//     handleClearHistory,
//     handleRecentSearchClick,
//     handleSuggestionClick
//   } = useSearch();

//   const {
//     showCategories,
//     setShowCategories,
//     activeCategory,
//     categories,
//     subcategories,
//     loadingCategories,
//     handleCategoryClick,
//     handleBackToCategories,
//     handleShowCategories,
//     handleBackToMain,
//     handleDesktopCategoryClick
//   } = useCategories(undefined, setSearchQuery, undefined, initialShowCategories);

//   // Force show categories when initialShowCategories is true
//   useEffect(() => {
//     if (initialShowCategories) {
//       setShowCategories(true);
//     }
//   }, [initialShowCategories, setShowCategories]);

//   // Handle clear search query
//   const handleClearSearch = () => {
//     setSearchQuery('');
//   };

//   // Modified search handler - navigates to products page
//   const handleSearch = () => {
//     if (searchQuery.trim()) {
//       router.push(`/seller/products?q=${encodeURIComponent(searchQuery.trim())}`);
//       setIsSearchModalOpen(false);
//     }
//   };

//   // Handle mobile subcategory click - navigate to products page
//   const handleMobileSubcategoryClick = (subcat) => {
//     router.push(`/seller/products?subcategory=${subcat.id}&subcategoryName=${encodeURIComponent(subcat.name)}`);
//     setShowCategories(false);
//   };

//   // Mobile Categories View
//   if (showCategories) {
//     return (
//       <MobileCategoriesPage
//         activeCategory={activeCategory}
//         categories={categories}
//         subcategories={subcategories}
//         loadingCategories={loadingCategories}
//         handleCategoryClick={handleCategoryClick}
//         handleBackToCategories={handleBackToCategories}
//         handleBackToMain={handleBackToMain}
//         handleSubcategoryClick={handleMobileSubcategoryClick}
//       />
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 lg:bg-gray-50" dir="rtl">
//       <SellerNavbar />
      
//       {/* Mobile Layout */}
//       <div className="lg:hidden min-h-screen pt-8 px-4 pb-20">
//         <HeaderSection />
//         <SearchSection 
//           onSearchInputClick={handleSearchInputClick}
//           mobile={true}
//         />
//       </div>

//       {/* Desktop Layout */}
//       <div className="hidden lg:block max-w-7xl mx-auto px-4 py-8">
//         <HeaderSection />
//         <SearchSection
//           searchQuery={searchQuery}
//           onSearchInputChange={handleSearchInputChange}
//           onSearchInputFocus={handleSearchInputFocus}
//           onSearchInputBlur={handleSearchInputBlur}
//           onSearch={handleSearch}
//           onClearSearch={handleClearSearch}
//           showSearchHistory={showSearchHistory}
//           searchSuggestions={searchSuggestions}
//           recentSearches={recentSearches}
//           showMore={false}
//           onSuggestionClick={(suggestion) => {
//             router.push(`/seller/products?subcategory=${suggestion.id}&subcategoryName=${encodeURIComponent(suggestion.title)}`);
//           }}
//           onRecentSearchClick={(item) => {
//             const query = typeof item === 'object' ? (item.title || item.query) : item;
//             router.push(`/seller/products?q=${encodeURIComponent(query)}`);
//           }}
//           onDeleteSearch={handleDeleteSearch}
//           onClearHistory={handleClearHistory}
//           onShowMoreToggle={() => {}}
//           mobile={false}
//         />
//         <CategoriesSection
//           activeCategory={activeCategory}
//           onCategoryClick={handleDesktopCategoryClick}
//           categories={categories}
//           subcategories={subcategories}
//           loadingCategories={loadingCategories}
//           onProductSelect={(product) => {
//             router.push(`/seller/products/${product.id}`);
//           }}
//         />
//       </div>

//       {/* Search Modal for Mobile */}
//       <SearchModal
//         isOpen={isSearchModalOpen}
//         onClose={() => setIsSearchModalOpen(false)}
//         searchQuery={searchQuery}
//         onSearchInputChange={handleSearchInputChange}
//         onSearch={handleSearch}
//         onClearSearch={handleClearSearch}
//         searchSuggestions={searchSuggestions}
//         onSuggestionClick={(suggestion) => {
//           router.push(`/seller/products?subcategory=${suggestion.id}&subcategoryName=${encodeURIComponent(suggestion.title)}`);
//           setIsSearchModalOpen(false);
//         }}
//         recentSearches={recentSearches}
//         onRecentSearchClick={(item) => {
//           const query = typeof item === 'object' ? (item.title || item.query) : item;
//           router.push(`/seller/products?q=${encodeURIComponent(query)}`);
//           setIsSearchModalOpen(false);
//         }}
//         onClearHistory={handleClearHistory}
//       />
//     </div>
//   );
// }












// "use client";

// import { useState, useEffect } from "react";
// import HeaderSection from "./HeaderSection";
// import SellerNavbar from "./SellerNavbar";
// import SearchSection from "./SearchSection";
// import CategoriesSection from "./CategoriesSection";
// import SearchResultsPage from "./SearchResultsPage";
// import ProductListPage from "./ProductListPage";
// import MobileCategoriesPage from "./MobileCategoriesPage";
// import SearchModal from "./SearchModal";
// import { useSearch } from "../hooks/useSearch";
// import { useCategories } from "../hooks/useCategories";
// import { FaList } from "react-icons/fa6";
// import { saveRecentSearch, getRecentSearches } from "../../../api/seller";
// import { useRouter } from "next/navigation";

// export default function MainPage({ initialShowCategories = false }) {
//   // Local states for UI controls
//   const [showDetails, setShowDetails] = useState(true);
//   const [showMore, setShowMore] = useState(false);
  
//   // New states for flow control
//   const [showProductList, setShowProductList] = useState(false);
//   const [currentSubcategory, setCurrentSubcategory] = useState(null);

//   const router = useRouter();

//   const {
//     searchQuery,
//     setSearchQuery,
//     hasSearched,
//     setHasSearched,
//     showSearchHistory,
//     searchSuggestions,
//     isSearchModalOpen,
//     setIsSearchModalOpen,
//     recentSearches,
//     selectedProduct,
//     setSelectedProduct,
//     handleSearch: originalHandleSearch,
//     handleRecentSearchClick,
//     handleSuggestionClick,
//     handleSearchInputChange,
//     handleSearchInputClick,
//     handleSearchInputFocus,
//     handleSearchInputBlur,
//     handleDeleteSearch,
//     handleClearHistory
//   } = useSearch();

//   const {
//     showCategories,
//     setShowCategories,
//     activeCategory,
//     showProducts,
//     categories,
//     subcategories,
//     loadingCategories,
//     handleCategoryClick,
//     handleBackToCategories,
//     handleShowCategories,
//     handleBackToMain,
//     handleDesktopCategoryClick
//   } = useCategories(setHasSearched, setSearchQuery, setSelectedProduct, initialShowCategories);

//   // Force show categories when initialShowCategories is true
//   useEffect(() => {
//     if (initialShowCategories) {
//       setShowProductList(false);
//       setCurrentSubcategory(null);
//       setHasSearched(false);
//       setSelectedProduct(null);
//       setShowCategories(true);
//     }
//   }, [initialShowCategories, setShowCategories, setHasSearched, setSelectedProduct, setShowProductList, setCurrentSubcategory]);

//   // Handle clear search query
//   const handleClearSearch = () => {
//     setSearchQuery('');
//   };

//   // Modified search handler - shows product list first
//   const handleSearch = () => {
//     if (searchQuery.trim()) {
//       // Clear URL params when showing product list
//       router.replace('/seller', { scroll: false });
//       setShowProductList(true);
//       setCurrentSubcategory(null);
//       setIsSearchModalOpen(false);
//     }
//   };

//   // Handle product selection from product list
//   const handleProductSelect = (product) => {
//     setSelectedProduct(product);
//     setSearchQuery(product.title);
    
//     // Save to recent searches
//     const searchItem = {
//       id: product.id,
//       title: product.title,
//       query: product.title,
//       timestamp: Date.now()
//     };
//     saveRecentSearch(searchItem);
    
//     setShowProductList(false);
//     setHasSearched(true);
//   };

//   // Handle back from product list
//   const handleBackFromProductList = () => {
//     // Clear URL params when going back
//     router.replace('/seller', { scroll: false });
//     setShowProductList(false);
//     setCurrentSubcategory(null);
//   };

//   // Handle back from search results
//   const handleBackFromResults = () => {
//     // Clear URL params when going back
//     router.replace('/seller', { scroll: false });
//     setHasSearched(false);
//     setSelectedProduct(null);
//     setSearchQuery('');
//   };

//   // Handle mobile subcategory click - show product list
//   const handleMobileSubcategoryClick = (subcat) => {
//     // Clear URL params when showing product list from categories
//     router.replace('/seller', { scroll: false });
//     setCurrentSubcategory(subcat);
//     setShowProductList(true);
//     setShowCategories(false);
//   };

//   // Show product list page (after search or subcategory click)
//   if (showProductList) {
//     return (
//       <ProductListPage
//         searchQuery={currentSubcategory ? null : searchQuery}
//         subcategoryId={currentSubcategory?.id}
//         subcategoryName={currentSubcategory?.name}
//         onBack={handleBackFromProductList}
//         onProductSelect={handleProductSelect}
//       />
//     );
//   }

//   // If user has selected a product, show search results (wholesalers)
//   if (hasSearched && selectedProduct) {
//     return (
//       <SearchResultsPage
//         searchQuery={searchQuery}
//         showDetails={showDetails}
//         setShowDetails={setShowDetails}
//         recentSearches={recentSearches}
//         showMore={showMore}
//         setShowMore={setShowMore}
//         handleSearch={handleSearch}
//         handleSearchInputChange={handleSearchInputChange}
//         handleSearchInputClick={handleSearchInputClick}
//         handleDeleteSearch={handleDeleteSearch}
//         handleClearHistory={handleClearHistory}
//         handleRecentSearchClick={handleRecentSearchClick}
//         selectedProduct={selectedProduct}
//         onBack={handleBackFromResults}
//       />
//     );
//   }

//   // Mobile Categories View
//   if (showCategories) {
//     return (
//       <MobileCategoriesPage
//         activeCategory={activeCategory}
//         showProducts={showProducts}
//         categories={categories}
//         subcategories={subcategories}
//         loadingCategories={loadingCategories}
//         handleCategoryClick={handleCategoryClick}
//         handleBackToCategories={handleBackToCategories}
//         handleBackToMain={handleBackToMain}
//         handleSubcategoryClick={handleMobileSubcategoryClick}
//       />
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 lg:bg-gray-50" dir="rtl">
//       <SellerNavbar />
      
//       {/* Mobile Layout */}
//       <div className="lg:hidden min-h-screen pt-8 px-4 pb-20">
//         <HeaderSection />
//         <SearchSection 
//           onSearchInputClick={handleSearchInputClick}
//           mobile={true}
//         />
//       </div>

//       {/* Desktop Layout */}
//       <div className="hidden lg:block max-w-7xl mx-auto px-4 py-8">
//         <HeaderSection />
//         <SearchSection
//           searchQuery={searchQuery}
//           onSearchInputChange={handleSearchInputChange}
//           onSearchInputFocus={handleSearchInputFocus}
//           onSearchInputBlur={handleSearchInputBlur}
//           onSearch={handleSearch}
//           onClearSearch={handleClearSearch} // Add this prop
//           showSearchHistory={showSearchHistory}
//           searchSuggestions={searchSuggestions}
//           recentSearches={recentSearches}
//           showMore={showMore}
//           onSuggestionClick={(suggestion) => {
//             setSearchQuery(suggestion.title);
            
//             const subcategory = {
//               id: suggestion.id,
//               name: suggestion.title,
//               categoryId: suggestion.categoryId,
//               categoryName: suggestion.categoryName
//             };
            
//             setCurrentSubcategory(subcategory);
//             setShowProductList(true);
//           }}
//           onRecentSearchClick={(item) => {
//             const query = typeof item === 'object' ? (item.title || item.query) : item;
//             setSearchQuery(query);
//             setShowProductList(true);
//             setCurrentSubcategory(null);
//           }}
//           onDeleteSearch={handleDeleteSearch}
//           onClearHistory={handleClearHistory}
//           onShowMoreToggle={() => setShowMore(!showMore)}
//           mobile={false}
//         />
//         <CategoriesSection
//           activeCategory={activeCategory}
//           onCategoryClick={handleDesktopCategoryClick}
//           categories={categories}
//           subcategories={subcategories}
//           loadingCategories={loadingCategories}
//           onProductSelect={handleProductSelect}
//         />
//       </div>

//       {/* Search Modal for Mobile */}
//       <SearchModal
//         isOpen={isSearchModalOpen}
//         onClose={() => setIsSearchModalOpen(false)}
//         searchQuery={searchQuery}
//         onSearchInputChange={handleSearchInputChange}
//         onSearch={handleSearch}
//         onClearSearch={handleClearSearch} // Add this prop
//         searchSuggestions={searchSuggestions}
//         onSuggestionClick={(suggestion) => {
//           setSearchQuery(suggestion.title);
          
//           const subcategory = {
//             id: suggestion.id,
//             name: suggestion.title,
//             categoryId: suggestion.categoryId,
//             categoryName: suggestion.categoryName
//           };
          
//           setCurrentSubcategory(subcategory);
//           setShowProductList(true);
//           setIsSearchModalOpen(false);
//         }}
//         recentSearches={recentSearches}
//         onRecentSearchClick={(item) => {
//           const query = typeof item === 'object' ? (item.title || item.query) : item;
//           setSearchQuery(query);
//           setShowProductList(true);
//           setCurrentSubcategory(null);
//           setIsSearchModalOpen(false);
//         }}
//         onClearHistory={handleClearHistory}
//       />
//     </div>
//   );
// }

















// "use client";

// import { useState, useEffect } from "react";
// import HeaderSection from "./HeaderSection";
// import SellerNavbar from "./SellerNavbar";
// import SearchSection from "./SearchSection";
// import CategoriesSection from "./CategoriesSection";
// import SearchResultsPage from "./SearchResultsPage";
// import ProductListPage from "./ProductListPage";
// import MobileCategoriesPage from "./MobileCategoriesPage";
// import SearchModal from "./SearchModal";
// import { useSearch } from "../hooks/useSearch";
// import { useCategories } from "../hooks/useCategories";
// import { FaList } from "react-icons/fa6";
// import { saveRecentSearch, getRecentSearches } from "../../../api/seller";
// import { useRouter } from "next/navigation";

// export default function MainPage({ initialShowCategories = false }) {
//   // Local states for UI controls
//   const [showDetails, setShowDetails] = useState(true);
//   const [showMore, setShowMore] = useState(false);
  
//   // New states for flow control
//   const [showProductList, setShowProductList] = useState(false);
//   const [currentSubcategory, setCurrentSubcategory] = useState(null);

//   const router = useRouter();

//   const {
//     searchQuery,
//     setSearchQuery,
//     hasSearched,
//     setHasSearched,
//     showSearchHistory,
//     searchSuggestions,
//     isSearchModalOpen,
//     setIsSearchModalOpen,
//     recentSearches,
//     selectedProduct,
//     setSelectedProduct,
//     handleSearch: originalHandleSearch,
//     handleRecentSearchClick,
//     handleSuggestionClick,
//     handleSearchInputChange,
//     handleSearchInputClick,
//     handleSearchInputFocus,
//     handleSearchInputBlur,
//     handleDeleteSearch,
//     handleClearHistory
//   } = useSearch();

//   const {
//     showCategories,
//     setShowCategories,
//     activeCategory,
//     showProducts,
//     categories,
//     subcategories,
//     loadingCategories,
//     handleCategoryClick,
//     handleBackToCategories,
//     handleShowCategories,
//     handleBackToMain,
//     handleDesktopCategoryClick
//   } = useCategories(setHasSearched, setSearchQuery, setSelectedProduct, initialShowCategories);

//   // Force show categories when initialShowCategories is true
//   // Also reset other states to ensure proper navigation
//   useEffect(() => {
//     if (initialShowCategories) {
//       setShowProductList(false);
//       setCurrentSubcategory(null);
//       setHasSearched(false);
//       setSelectedProduct(null);
//       setShowCategories(true);
//     }
//   }, [initialShowCategories, setShowCategories, setHasSearched, setSelectedProduct, setShowProductList, setCurrentSubcategory]);

//   // Modified search handler - shows product list first
//   const handleSearch = () => {
//     if (searchQuery.trim()) {
//       // Clear URL params when showing product list
//       router.replace('/seller', { scroll: false });
//       setShowProductList(true);
//       setCurrentSubcategory(null);
//       setIsSearchModalOpen(false);
//     }
//   };

//   // Handle product selection from product list
//   const handleProductSelect = (product) => {
//     setSelectedProduct(product);
//     setSearchQuery(product.title);
    
//     // Save to recent searches
//     const searchItem = {
//       id: product.id,
//       title: product.title,
//       query: product.title,
//       timestamp: Date.now()
//     };
//     saveRecentSearch(searchItem);
    
//     setShowProductList(false);
//     setHasSearched(true);
//   };

//   // Handle back from product list
//   const handleBackFromProductList = () => {
//     // Clear URL params when going back
//     router.replace('/seller', { scroll: false });
//     setShowProductList(false);
//     setCurrentSubcategory(null);
//   };

//   // Handle back from search results
//   const handleBackFromResults = () => {
//     // Clear URL params when going back
//     router.replace('/seller', { scroll: false });
//     setHasSearched(false);
//     setSelectedProduct(null);
//     setSearchQuery('');
//   };

//   // Handle mobile subcategory click - show product list
//   const handleMobileSubcategoryClick = (subcat) => {
//     // Clear URL params when showing product list from categories
//     router.replace('/seller', { scroll: false });
//     setCurrentSubcategory(subcat);
//     setShowProductList(true);
//     setShowCategories(false);
//   };

//   // Show product list page (after search or subcategory click)
//   if (showProductList) {
//     return (
//       <ProductListPage
//         searchQuery={currentSubcategory ? null : searchQuery}
//         subcategoryId={currentSubcategory?.id}
//         subcategoryName={currentSubcategory?.name}
//         onBack={handleBackFromProductList}
//         onProductSelect={handleProductSelect}
//       />
//     );
//   }

//   // If user has selected a product, show search results (wholesalers)
//   if (hasSearched && selectedProduct) {
//     return (
//       <SearchResultsPage
//         searchQuery={searchQuery}
//         showDetails={showDetails}
//         setShowDetails={setShowDetails}
//         recentSearches={recentSearches}
//         showMore={showMore}
//         setShowMore={setShowMore}
//         handleSearch={handleSearch}
//         handleSearchInputChange={handleSearchInputChange}
//         handleSearchInputClick={handleSearchInputClick}
//         handleDeleteSearch={handleDeleteSearch}
//         handleClearHistory={handleClearHistory}
//         handleRecentSearchClick={handleRecentSearchClick}
//         selectedProduct={selectedProduct}
//         onBack={handleBackFromResults}
//       />
//     );
//   }

//   // Mobile Categories View
//   if (showCategories) {
//     return (
//       <MobileCategoriesPage
//         activeCategory={activeCategory}
//         showProducts={showProducts}
//         categories={categories}
//         subcategories={subcategories}
//         loadingCategories={loadingCategories}
//         handleCategoryClick={handleCategoryClick}
//         handleBackToCategories={handleBackToCategories}
//         handleBackToMain={handleBackToMain}
//         handleSubcategoryClick={handleMobileSubcategoryClick}
//       />
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 lg:bg-gray-50" dir="rtl">
//       <SellerNavbar />
      
//       {/* Mobile Layout */}
//       <div className="lg:hidden min-h-screen pt-8 px-4 pb-20">
//         <HeaderSection />
//         <SearchSection 
//           onSearchInputClick={handleSearchInputClick}
//           mobile={true}
//         />
//         {/* <div className="fixed bottom-20 left-4 right-4">
//           <button
//             onClick={handleShowCategories}
//             className="w-full bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-3 shadow-lg"
//           >
//             <FaList className="text-lg" />
//             مشاهده دسته‌بندی‌ها
//           </button>
//         </div> */}
//       </div>

//       {/* Desktop Layout */}
//       <div className="hidden lg:block max-w-7xl mx-auto px-4 py-8">
//         <HeaderSection />
//         <SearchSection
//           searchQuery={searchQuery}
//           onSearchInputChange={handleSearchInputChange}
//           onSearchInputFocus={handleSearchInputFocus}
//           onSearchInputBlur={handleSearchInputBlur}
//           onSearch={handleSearch}
//           showSearchHistory={showSearchHistory}
//           searchSuggestions={searchSuggestions}
//           recentSearches={recentSearches}
//           showMore={showMore}
//           onSuggestionClick={(suggestion) => {
//             // For subcategory suggestions
//             setSearchQuery(suggestion.title);
            
//             // Set the subcategory directly
//             const subcategory = {
//               id: suggestion.id,
//               name: suggestion.title,
//               categoryId: suggestion.categoryId,
//               categoryName: suggestion.categoryName
//             };
            
//             setCurrentSubcategory(subcategory);
//             setShowProductList(true);
//           }}
//           onRecentSearchClick={(item) => {
//             const query = typeof item === 'object' ? (item.title || item.query) : item;
//             setSearchQuery(query);
//             setShowProductList(true);
//             setCurrentSubcategory(null);
//           }}
//           onDeleteSearch={handleDeleteSearch}
//           onClearHistory={handleClearHistory}
//           onShowMoreToggle={() => setShowMore(!showMore)}
//           mobile={false}
//         />
//         <CategoriesSection
//           activeCategory={activeCategory}
//           onCategoryClick={handleDesktopCategoryClick}
//           categories={categories}
//           subcategories={subcategories}
//           loadingCategories={loadingCategories}
//           onProductSelect={handleProductSelect}
//         />
//       </div>

//       {/* Search Modal for Mobile */}
//       <SearchModal
//         isOpen={isSearchModalOpen}
//         onClose={() => setIsSearchModalOpen(false)}
//         searchQuery={searchQuery}
//         onSearchInputChange={handleSearchInputChange}
//         onSearch={handleSearch}
//         searchSuggestions={searchSuggestions}
//         onSuggestionClick={(suggestion) => {
//           // For subcategory suggestions
//           setSearchQuery(suggestion.title);
          
//           // Set the subcategory directly
//           const subcategory = {
//             id: suggestion.id,
//             name: suggestion.title,
//             categoryId: suggestion.categoryId,
//             categoryName: suggestion.categoryName
//           };
          
//           setCurrentSubcategory(subcategory);
//           setShowProductList(true);
//           setIsSearchModalOpen(false);
//         }}
//         recentSearches={recentSearches}
//         onRecentSearchClick={(item) => {
//           const query = typeof item === 'object' ? (item.title || item.query) : item;
//           setSearchQuery(query);
//           setShowProductList(true);
//           setCurrentSubcategory(null);
//           setIsSearchModalOpen(false);
//         }}
//         onClearHistory={handleClearHistory}
//       />
//     </div>
//   );
// }