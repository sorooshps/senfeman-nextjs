"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import ProductListPage from "../components/ProductListPage";
import { useState, useEffect } from "react";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, loading, error, getToken } = useAuth('seller', { skipRoleRedirect: true });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [subcategoryId, setSubcategoryId] = useState(null);
  const [subcategoryName, setSubcategoryName] = useState("");

  // Read URL parameters
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const subcatId = searchParams.get('subcategory') || null;
    const subcatName = searchParams.get('subcategoryName') || '';
    
    setSearchQuery(q);
    setSubcategoryId(subcatId);
    setSubcategoryName(decodeURIComponent(subcatName));
  }, [searchParams]);

  const handleBack = () => {
    // Go back to seller main page
    router.push('/seller');
  };

  const handleProductSelect = (product) => {
    // Navigate to product details page with the product ID
    router.push(`/seller/products/${product.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
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
    <ProductListPage
      searchQuery={searchQuery}
      subcategoryId={subcategoryId}
      subcategoryName={subcategoryName}
      onBack={handleBack}
      onProductSelect={handleProductSelect}
    />
  );
}