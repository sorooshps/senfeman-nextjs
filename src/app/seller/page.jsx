"use client";

import { useAuth } from "../../hooks/useAuth";
import MainPage from "./components/MainPage";
import { useSearchParams } from "next/navigation";

export default function SellerPage() {
  const { isAuthenticated, loading, error } = useAuth('seller', { skipRoleRedirect: true });
  const searchParams = useSearchParams();
  const showCategories = searchParams.get('showCategories') === 'true';

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

  return <MainPage initialShowCategories={showCategories} />;
}
