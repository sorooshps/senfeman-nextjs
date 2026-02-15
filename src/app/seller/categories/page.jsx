"use client";

import { useAuth } from "../../../hooks/useAuth";
import MobileCategoriesPage from "../components/MobileCategoriesPage";
import { useCategories } from "../hooks/useCategories";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // ADD useState

export default function CategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, loading, error } = useAuth('seller', { skipRoleRedirect: true });
  
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
    handleBackToMain
  } = useCategories();

  // ADD STATE FOR SHOWING PRODUCTS/SUBCATEGORIES
  const [showProducts, setShowProducts] = useState(false);

  // Force show categories on mobile
  useEffect(() => {
    setShowCategories(true);
  }, [setShowCategories]);

  // Handle category click - show subcategories
  const handleCategoryClickWithState = (index) => {
    handleCategoryClick(index);
    setShowProducts(true); // Show subcategories when category is clicked
  };

  // Handle back to categories list
  const handleBackToCategoriesList = () => {
    setShowProducts(false); // Go back to categories list
  };

  // Handle mobile subcategory click - navigate to products page
  const handleMobileSubcategoryClick = (subcat) => {
    router.push(`/seller/products?subcategory=${subcat.id}&subcategoryName=${encodeURIComponent(subcat.name)}`);
  };

  // Handle back to main page
  const handleBackToSellerMain = () => {
    router.push('/seller');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
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

  // Desktop redirect - redirect desktop users to main page
  if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
    router.push('/seller');
    return null;
  }

  return (
    <MobileCategoriesPage
      activeCategory={activeCategory}
      showProducts={showProducts} // PASS THE STATE
      categories={categories}
      subcategories={subcategories}
      loadingCategories={loadingCategories}
      handleCategoryClick={handleCategoryClickWithState} // USE UPDATED FUNCTION
      handleBackToCategories={handleBackToCategoriesList} // USE UPDATED FUNCTION
      handleBackToMain={handleBackToSellerMain}
      handleSubcategoryClick={handleMobileSubcategoryClick}
    />
  );
}