"use client";

// senfeman-next-js/src/app/seller/[slug]/index.jsx
import { useAuth } from "../../hooks/useAuth";
import SearchResultsPage from "../components/SearchResultsPage";

export default function SellerPage({ params }) {
  console.log('Slug route accessed with params:', params);
  
  const { isAuthenticated, loading, error } = useAuth('seller');

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

  return <SearchResultsPage slug={params.slug} />;
}