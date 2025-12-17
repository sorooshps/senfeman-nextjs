"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth";
import apiConfig from "../../../config/api.config";
import { FaPhone, FaChevronDown, FaChevronUp, FaMapPin } from "react-icons/fa6";
import { IoIosClose, IoIosCall } from "react-icons/io";
import { MdOutlineInventory2 } from "react-icons/md";
import HeaderSection from "./HeaderSection";
import SellerNavbar from "./SellerNavbar";
import SearchInput from "./SearchInput";
import logo from "../../../assets/fonts/ic_neo.png";
import RecentSearches from "./RecentSearches";
import { useAuth } from "../../../hooks/useAuth";
import {
  getWholesalersByProduct,
  getWholesalersByCategoryProduct,
} from "../../../api/seller";
import SearchModal from "./SearchModal";

const SearchResultsPage = ({
  searchQuery,
  showDetails,
  setShowDetails,
  recentSearches,
  showMore,
  setShowMore,
  handleSearch,
  handleSearchInputChange,
  handleSearchInputClick,
  handleDeleteSearch,
  handleClearHistory,
  handleRecentSearchClick,
  selectedProduct,
  onBack,
  slug,
}) => {
  const { getToken } = useAuth("seller", { skipRoleRedirect: true });
  const [activeTab, setActiveTab] = useState("exact"); // 'exact' or 'estimated'
  const [exactSellers, setExactSellers] = useState([]);
  const [estimatedSellers, setEstimatedSellers] = useState([]);
  const [loadingExact, setLoadingExact] = useState(false);
  const [loadingEstimated, setLoadingEstimated] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Log when component receives props
  console.log(
    "[SearchResultsPage] Received props - selectedProduct:",
    selectedProduct,
    "slug:",
    slug
  );

  // Fetch wholesalers when selectedProduct changes
  useEffect(() => {
    console.log(
      "[SearchResultsPage] useEffect triggered - selectedProduct:",
      selectedProduct
    );
    const fetchWholesalers = async () => {
      if (!selectedProduct?.id) {
        console.log(
          "[SearchResultsPage] No selectedProduct.id, skipping wholesaler fetch"
        );
        return;
      }
      console.log(
        "[SearchResultsPage] Fetching wholesalers for product ID:",
        selectedProduct.id
      );

      const token = getToken();
      if (!token) return;

      // Fetch exact match wholesalers
      setLoadingExact(true);
      try {
        const response = await getWholesalersByProduct(
          selectedProduct.id,
          token
        );
        const sellers = response.results || response || [];
        console.log("[EXACT SELLERS] Response:", sellers);
        setExactSellers(sellers);
      } catch (err) {
        console.error("Failed to fetch exact sellers:", err);
        setExactSellers([]);
      } finally {
        setLoadingExact(false);
      }

      // Fetch estimated match wholesalers (category-based)
      setLoadingEstimated(true);
      try {
        const response = await getWholesalersByCategoryProduct(
          selectedProduct.id,
          token
        );
        const sellers = response.results || response || [];
        console.log("[ESTIMATED SELLERS] Response:", sellers);
        setEstimatedSellers(sellers);
      } catch (err) {
        console.error("Failed to fetch estimated sellers:", err);
        setEstimatedSellers([]);
      } finally {
        setLoadingEstimated(false);
      }
    };

    fetchWholesalers();
  }, [selectedProduct, getToken]);

  const currentSellers =
    activeTab === "exact" ? exactSellers : estimatedSellers;
  const isLoading = activeTab === "exact" ? loadingExact : loadingEstimated;

  // Import API config
  const API_BASE_URL = apiConfig.API_BASE_URL;
  
  // Function to extract product image and make URLs absolute
  const getProductImage = (product = selectedProduct) => {
    console.log('Getting image for product:', product?.id, product?.title);
    console.log('Product images:', product?.images);
    
    if (product?.images && product.images.length > 0) {
      console.log('First image object:', product.images[0]);
      let imageUrl = product.images[0].image_url;
      
      // Return null if no image URL
      if (!imageUrl) return null;
      
      // If URL is already absolute (starts with http), return it as is
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      // Make sure the URL doesn't have double slashes
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      imageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      
      console.log('Constructed image URL:', `${baseUrl}${imageUrl}`);
      return `${baseUrl}${imageUrl}`;
    }
    return null;
  };

  return (
    <div
      className="min-h-screen bg-gray-50 "
      dir="rtl"
    >
      <SellerNavbar />

      {/* Mobile Results View */}
      <div className="lg:hidden pb-20 px-4">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-4 mt-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IoIosClose size={24} />
            </button>
          )}
          <h2 className="text-lg font-semibold text-gray-900">نتایج جستجو</h2>
        </div>

        {/* Product Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
          <div className="flex items-center gap-3">
            {getProductImage(selectedProduct) ? (
              <img
                src={getProductImage(selectedProduct)}
                alt="product"
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <Image
                src={logo}
                alt="product"
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                {selectedProduct?.title || "محصول"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  موجود
                </span>
                {selectedProduct?.code && (
                  <span className="text-xs text-gray-500">
                    #{selectedProduct.code}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600"
            >
              {showDetails ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>

          {showDetails && selectedProduct && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-600 space-y-1">
                {selectedProduct.categories?.map((cat, i) => (
                  <div key={i}>• دسته: {cat.name}</div>
                ))}
                {selectedProduct.colors?.map((color, i) => (
                  <div key={i}>• رنگ: {color.name}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchInputChange}
            onClick={() => setIsSearchModalOpen(true)}
            onSearch={handleSearch}
            mobile={true}
          />
        </div>

        {/* Seller Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("exact")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 ${
                activeTab === "exact"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              } font-medium`}
            >
              <MdOutlineInventory2 />
              <span>موجودی دقیق</span>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {exactSellers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("estimated")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 ${
                activeTab === "estimated"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              <span>موجودی احتمالی</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {estimatedSellers.length}
              </span>
            </button>
          </div>
        </div>

        {/* Sellers List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : currentSellers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              فروشنده‌ای یافت نشد
            </div>
          ) : (
            currentSellers.slice(0, 3).map((item, index) => (
           <div
  key={index}
  dir="rtl"
  className="
    w-full bg-white border border-gray-200 rounded-2xl
    p-4 sm:p-5
    flex flex-col gap-5
    sm:flex-row sm:items-center sm:justify-between
  "
>
  {/* Main content wrapper for mobile */}
  <div className="flex items-start gap-4 sm:flex-1 sm:items-center">
    {/* Phone Icon - More prominent on mobile */}
    <div className="flex-shrink-0">
      <div className="
        w-14 h-14
        sm:w-12 sm:h-12 
        rounded-xl bg-emerald-50 
        flex items-center justify-center
        shadow-sm
      ">
        <FaPhone
          className="text-emerald-500 text-xl sm:text-lg"
        />
      </div>
    </div>

    {/* Content area */}
    <div className="flex-1">
      {/* Seller Info - Moved to top on mobile */}
      <div className="mb-4 sm:mb-3">
        <div className="text-lg font-bold text-gray-900">
          عمده فروشی آریا
        </div>
        <div className="text-sm text-gray-600 mt-1">
          فروشنده:{" "}
          <span className="text-gray-800 font-semibold">
            {item.wholesaler?.first_name} {item.wholesaler?.last_name}
          </span>
        </div>
      </div>

      {/* Phone Numbers - Better spacing */}
      <div className="space-y-3 sm:space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <span className="
            text-sm text-gray-500 
            whitespace-nowrap
            w-24 sm:w-auto
          ">
            شماره ثابت:
          </span>
          <a 
            href={`tel:${item.wholesaler?.phone}`}
            className="
              text-base text-gray-900 font-semibold
              hover:text-emerald-600 transition-colors
              active:opacity-70
            "
          >
            {item.wholesaler?.phone || "---"}
          </a>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <span className="
            text-sm text-gray-500 
            whitespace-nowrap
            w-24 sm:w-auto
          ">
            شماره همراه:
          </span>
          <a 
            href={`tel:${item.wholesaler?.phone}`}
            className="
              text-base text-gray-900 font-semibold
              hover:text-emerald-600 transition-colors
              active:opacity-70
            "
          >
            {item.wholesaler?.phone || "---"}
          </a>
        </div>
      </div>
    </div>
  </div>

  {/* Optional action button for mobile */}
  <div className="
    mt-4 pt-4 border-t border-gray-100 
    sm:hidden
  ">
    <button className="
      w-full py-3 px-4
      bg-emerald-50 text-emerald-700 
      rounded-xl text-sm font-semibold
      active:bg-emerald-100 transition-colors
      flex items-center justify-center gap-2
    ">
      <FaPhone className="text-sm" />
      تماس سریع
    </button>
  </div>
</div>


            ))
          )}
        </div>
      </div>

      {/* Desktop Results View */}
      <div className="hidden lg:block min-h-screen bg-gray-50">
        <div className="max-w-8xl mx-auto px-4 py-8">
          {/* Back button for desktop */}
          <div className="mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium bg-white rounded-xl border border-blue-100 py-2 px-4 hover:bg-blue-50 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
              </svg>
              بازگشت
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* RIGHT CONTENT - Sellers List */}
            <div className="lg:col-span-2">
              <div className="p-8">
                <HeaderSection />

                {/* Search Bar */}
                <div className="relative mb-8">
                  <SearchInput
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onSearch={handleSearch}
                    mobile={false}
                  />
                </div>

                <div className="" dir="rtl">
                  {/* Tabs */}
                  <div className="flex gap-8 mb-6 border-b pb-2">
                    <button
                      onClick={() => setActiveTab("exact")}
                      className={`flex items-center gap-2 font-semibold pb-3 px-1 border-b-2 ${
                        activeTab === "exact"
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-gray-700"
                      }`}
                    >
                      <MdOutlineInventory2 className="text-lg" />
                      موجودی دقیق
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {exactSellers.length} فروشنده
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("estimated")}
                      className={`flex items-center gap-2 pb-3 px-1 border-b-2 ${
                        activeTab === "estimated"
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-gray-700"
                      }`}
                    >
                      موجودی احتمالی
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {estimatedSellers.length}
                      </span>
                    </button>
                  </div>

                  {/* Sellers List with Logos */}
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : currentSellers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        فروشنده‌ای یافت نشد
                      </div>
                    ) : (
                      currentSellers.map((item, index) => (
                        // <SellerCard key={index} seller={item} />
                        <div
  key={index}
  dir="rtl"
  className="
    w-full bg-white border border-gray-200 rounded-2xl
    p-4 sm:p-5
    flex flex-col gap-5
    sm:flex-row sm:items-center sm:justify-between
  "
>
  {/* Main content wrapper for mobile */}
  <div className="flex items-start gap-4 sm:flex-1 sm:items-center">
    {/* Phone Icon - More prominent on mobile */}
    <div className="flex-shrink-0">
      <div className="
        w-14 h-14
        sm:w-12 sm:h-12 
        rounded-xl bg-emerald-50 
        flex items-center justify-center
        shadow-sm
      ">
        <FaPhone
          className="text-emerald-500 text-xl sm:text-lg"
        />
      </div>
    </div>

    {/* Content area */}
    <div className="flex-1">
      {/* Seller Info - Moved to top on mobile */}
      <div className="mb-4 sm:mb-3">
        <div className="text-lg font-bold text-gray-900">
          عمده فروشی آریا
        </div>
        <div className="text-sm text-gray-600 mt-1">
          فروشنده:{" "}
          <span className="text-gray-800 font-semibold">
            {item.wholesaler?.first_name} {item.wholesaler?.last_name}
          </span>
        </div>
      </div>

      {/* Phone Numbers - Better spacing */}
      <div className="space-y-3 sm:space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <span className="
            text-sm text-gray-500 
            whitespace-nowrap
            w-24 sm:w-auto
          ">
            شماره ثابت:
          </span>
          <a 
            href={`tel:${item.wholesaler?.phone}`}
            className="
              text-base text-gray-900 font-semibold
              hover:text-emerald-600 transition-colors
              active:opacity-70
            "
          >
            {item.wholesaler?.phone || "---"}
          </a>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <span className="
            text-sm text-gray-500 
            whitespace-nowrap
            w-24 sm:w-auto
          ">
            شماره همراه:
          </span>
          <a 
            href={`tel:${item.wholesaler?.phone}`}
            className="
              text-base text-gray-900 font-semibold
              hover:text-emerald-600 transition-colors
              active:opacity-70
            "
          >
            {item.wholesaler?.phone || "---"}
          </a>
        </div>
      </div>
    </div>
  </div>

  {/* Optional action button for mobile */}
  <div className="
    mt-4 pt-4 border-t border-gray-100 
    sm:hidden
  ">
    <button className="
      w-full py-3 px-4
      bg-emerald-50 text-emerald-700 
      rounded-xl text-sm font-semibold
      active:bg-emerald-100 transition-colors
      flex items-center justify-center gap-2
    ">
      <FaPhone className="text-sm" />
      تماس سریع
    </button>
  </div>
</div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* LEFT SIDEBAR */}
            <div className="lg:col-span-2 space-y-6 mt-[216px]" dir="rtl">
              {/* Product Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <div className="flex items-center gap-4">
                    {getProductImage(selectedProduct) ? (
                      <img
                        src={getProductImage(selectedProduct)}
                        alt="product"
                        className="w-16 h-16 rounded-xl object-cover shadow-md"
                      />
                    ) : (
                      <Image
                        src={logo}
                        alt="product"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-xl object-cover shadow-md"
                      />
                    )}
                    <div>
                      <h2 className="font-bold text-gray-900 text-lg">
                        {selectedProduct?.title || "محصول"}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          موجود
                        </span>
                        {selectedProduct?.code && (
                          <span className="text-xs text-gray-500">
                            #{selectedProduct.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    {showDetails ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>

                {showDetails && selectedProduct && (
                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">
                          اطلاعات محصول
                        </h4>
                        <ul className="text-gray-600 text-sm space-y-2">
                          {selectedProduct.categories?.map((cat, i) => (
                            <li key={i} className="flex items-center gap-2">
                              • دسته: {cat.name}
                            </li>
                          ))}
                          {selectedProduct.colors?.map((color, i) => (
                            <li key={i} className="flex items-center gap-2">
                              • رنگ: {color.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Searches Card */}
              <RecentSearches
                recentSearches={recentSearches}
                showMore={showMore}
                onDeleteSearch={handleDeleteSearch}
                onClearHistory={handleClearHistory}
                onRecentSearchClick={handleRecentSearchClick}
                onShowMoreToggle={() => setShowMore(!showMore)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal for Mobile */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchQuery={searchQuery}
        onSearchInputChange={handleSearchInputChange}
        onSearch={handleSearch}
        searchSuggestions={[]}
        onSuggestionClick={() => {}}
        recentSearches={recentSearches}
        onRecentSearchClick={handleRecentSearchClick}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
};

const SellerCard = ({ seller }) => {
  const wholesaler = seller.wholesaler || {};
  const fullName =
    `${wholesaler.first_name || ""} ${wholesaler.last_name || ""}`.trim() ||
    "فروشنده";

  return (
    <div
      className="flex flex-col sm:flex-row gap-4 border border-gray-200 rounded-2xl p-3 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white group"
      dir="ltr"
    >
      {/* Left part with phone icon and numbers */}
      <div className="flex items-center justify-center gap-0 flex-1  overflow-hidden ">
        {/* Green full-height phone icon section */}
        <div className="bg-green-500 rounded-xl text-white flex py-5 items-center justify-center px-1 md:px-4">
          <FaPhone className="text-sm" />
        </div>

        {/* Right side of left part */}
        <div className="flex-1 p-1 md:p-2">
          {/* Top: شماره ثابت */}
          <div className=" flex justify-center items-center gap-2">
            <div className=" text-xs text-gray-900 font-light">
              {wholesaler.phone || "---"}
            </div>
            <div className="text-xs text-gray-500 ">شماره ثابت</div>
          </div>

          {/* Bottom: شماره همراه */}
          <div className=" flex justify-center items-center gap-2">
            <div className=" text-xs text-gray-900 font-light">
              {wholesaler.phone || "---"}
            </div>
            <div className="text-xs text-gray-500 ">شماره همراه</div>
          </div>
        </div>
      </div>

      {/* Right part with wholesaler information */}
      <div
        className="flex flex-col justify-start  gap-3 sm:items-start flex-1"
        dir="rtl"
      >
        {/* Top part: فقط نام کامل عمده فروش */}
        <div className=" w-full">
          <h3 className="text-gray-900 font-bold text-md mb-1">{fullName}</h3>
          {/* {wholesaler.operate && (
        <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">فعال</span>
      )} */}
        </div>

        {/* Bottom part: فروشنده + نام کامل عمده فروش */}
        <div className="flex items-center gap-2  w-full">
          <span className="text-gray-500 text-sm">فروشنده:</span>
          <span className="text-gray-900 font-medium">{fullName}</span>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
