"use client";

import { use, useState, useEffect, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import SearchResultsPage from "../components/SearchResultsPage";
import { useSearch } from "../hooks/useSearch";
import { getProductDetail } from "../../../api/seller";

export default function SellerPage({ params }) {
  const resolvedParams = use(params);
  const { isAuthenticated, loading, error, getToken } = useAuth('seller', { skipRoleRedirect: true });
  const router = useRouter();

  // Search state
  const [showDetails, setShowDetails] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [productLoading, setProductLoading] = useState(true);

  // Back handler
  const handleBack = () => {
    router.back();
  };

  const {
    searchQuery,
    recentSearches,
    selectedProduct,
    setSelectedProduct,
    handleSearch,
    handleRecentSearchClick,
    handleSearchInputChange,
    handleSearchInputClick,
    handleDeleteSearch,
    handleClearHistory
  } = useSearch();

  // Prevent double fetching
  const hasFetched = useRef(false);

  // Fetch product data using slug when page loads
  useEffect(() => {
    const fetchProductBySlug = async () => {
      if (hasFetched.current) return;
      
      const productId = resolvedParams.slug;
      
      // If we already have this product selected, skip fetching
      if (selectedProduct?.id?.toString() === productId?.toString()) {
        setProductLoading(false);
        return;
      }

      const token = getToken();
      if (!token) {
        setProductLoading(false);
        return;
      }

      hasFetched.current = true;
      setProductLoading(true);
      
      try {
        const response = await getProductDetail(productId, token);
        if (response && response.id) {
          setSelectedProduct(response);
        }
      } catch {
        // Silent error - user will see empty state
      } finally {
        setProductLoading(false);
      }
    };

    if (isAuthenticated && !loading && !hasFetched.current) {
      fetchProductBySlug();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.slug, isAuthenticated, loading]);

  if (loading || productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{productLoading ? 'در حال بارگذاری محصول...' : 'در حال بارگذاری...'}</p>
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
    return null; // Hook handles redirect
  }

  return (
    <SearchResultsPage
      slug={resolvedParams.slug}
      searchQuery={searchQuery}
      showDetails={showDetails}
      setShowDetails={setShowDetails}
      recentSearches={recentSearches || []}
      showMore={showMore}
      setShowMore={setShowMore}
      handleSearch={handleSearch}
      handleSearchInputChange={handleSearchInputChange}
      handleSearchInputClick={handleSearchInputClick}
      handleDeleteSearch={handleDeleteSearch}
      handleClearHistory={handleClearHistory}
      handleRecentSearchClick={handleRecentSearchClick}
      selectedProduct={selectedProduct}
      onBack={handleBack}
    />
  );
}
