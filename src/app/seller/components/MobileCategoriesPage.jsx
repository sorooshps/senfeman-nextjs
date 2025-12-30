"use client";

import Image from "next/image";
import { FaChevronLeft } from "react-icons/fa6";
import { IoIosArrowBack } from "react-icons/io";
import logo from "../../../assets/fonts/LOGO_SVG.svg";
import SellerNavbar from "./SellerNavbar";
import apiConfig from "../../../config/api.config";

const API_BASE_URL = apiConfig.API_BASE_URL;

const MobileCategoriesPage = ({
  activeCategory,
  showProducts,
  categories = [],
  subcategories = [],
  loadingCategories = false,
  handleCategoryClick,
  handleBackToCategories,
  handleBackToMain,
  handleSubcategoryClick
}) => {
  // Get category image with proper URL formatting
  const getCategoryImage = (category) => {
    if (category?.image) {
      let imageUrl = category.image;
      
      // If URL is already absolute (starts with http), return it as is
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      // Remove '/media' prefix if it exists
      if (imageUrl.startsWith('/media/')) {
        imageUrl = imageUrl.replace('/media', '');
      }
      
      // Make sure the URL doesn't have double slashes
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const formattedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      
      return `${baseUrl}${formattedUrl}`;
    }
    return null;
  };

  // Get subcategory image with proper URL formatting
  const getSubcategoryImage = (subcat) => {
    if (subcat?.image) {
      let imageUrl = subcat.image;
      
      // If URL is already absolute (starts with http), return it as is
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      // Remove '/media' prefix if it exists
      if (imageUrl.startsWith('/media/')) {
        imageUrl = imageUrl.replace('/media', '');
      }
      
      // Make sure the URL doesn't have double slashes
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const formattedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      
      return `${baseUrl}${formattedUrl}`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 mb-20" dir="rtl">
      <SellerNavbar />
      
      {/* Mobile Categories View */}
      <div className="lg:hidden bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={showProducts ? handleBackToCategories : handleBackToMain}
              className="p-2 text-gray-600"
            >
              <IoIosArrowBack size={24} />
            </button>
            <h1 className="font-bold text-lg text-gray-900">
              {showProducts ? categories[activeCategory]?.name : 'دسته‌بندی‌ها'}
            </h1>
          </div>
        </div>

        {loadingCategories ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : !showProducts ? (
          // Categories List
          <div className="px-4 py-4">
            <div className="space-y-2">
              {categories.map((category, index) => (
                <button
                  key={category.id || index}
                  onClick={() => handleCategoryClick(index)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {getCategoryImage(category) && (
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                        <img src={getCategoryImage(category)} alt={category.name} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <span className="font-medium text-gray-700">
                      {category.name}
                    </span>
                  </div>
                  <FaChevronLeft className="text-gray-400 text-sm" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Subcategories View
          <div className="px-4 py-4">
            <p className="text-sm text-gray-500 mb-4">
              {subcategories.length} زیردسته
            </p>

            {/* Subcategories Grid */}
            <div className="grid grid-cols-2 gap-4">
              {subcategories.map((subcat, index) => (
                <button
                  key={subcat.id || index}
                  onClick={() => handleSubcategoryClick && handleSubcategoryClick(subcat)}
                  className="group border-2 border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-lg transition-all bg-white flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                    {getSubcategoryImage(subcat) ? (
                      <img src={getSubcategoryImage(subcat)} alt={subcat.name} className="w-full h-full object-contain" />
                    ) : (
                      <Image src={logo} alt={subcat.name} width={40} height={40} />
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm text-center">
                    {subcat.name}
                  </h3>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCategoriesPage;