"use client";

import { use, useState, useEffect, useRef } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import SearchResultsPage from "../../components/SearchResultsPage";
import { useSearch } from "../../hooks/useSearch";
import { getProductDetail } from "../../../../api/seller";

export default function ProductDetailsPage({ params }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const { isAuthenticated, loading, error, getToken } = useAuth('seller', { skipRoleRedirect: true });
  const router = useRouter();

  const productId = resolvedParams.productId;
  const searchQuery = searchParams.get('q') || '';

  // Search state
  const [showDetails, setShowDetails] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [productLoading, setProductLoading] = useState(true);

  const {
    searchQuery: searchQueryFromHook,
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

  // Use search query from URL or from hook
  const finalSearchQuery = searchQuery || searchQueryFromHook;

  // Prevent double fetching
  const hasFetched = useRef(false);

  // Fetch product data using productId when page loads
  useEffect(() => {
    const fetchProductById = async () => {
      if (hasFetched.current) return;
      
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
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setProductLoading(false);
      }
    };

    if (isAuthenticated && !loading && !hasFetched.current) {
      fetchProductById();
    }
  }, [productId, isAuthenticated, loading, selectedProduct, getToken, setSelectedProduct]);

  // Back handler
  const handleBack = () => {
    // Go back to products list
    if (finalSearchQuery) {
      router.push(`/seller/products?q=${encodeURIComponent(finalSearchQuery)}`);
    } else if (selectedProduct?.categories?.[0]?.id) {
      // If product has a category, go back to products with that category
      router.push(`/seller/products?subcategory=${selectedProduct.categories[0].id}&subcategoryName=${encodeURIComponent(selectedProduct.categories[0].name)}`);
    } else {
      router.push('/seller/products');
    }
  };

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
      slug={productId}
      searchQuery={finalSearchQuery}
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