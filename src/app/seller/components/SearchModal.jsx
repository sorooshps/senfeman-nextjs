"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaSearchengin, FaClockRotateLeft, FaArrowLeft } from "react-icons/fa6";
import { X, Search, TrendingUp, Sparkles } from "lucide-react";

const SearchModal = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchInputChange,
  onSearch,
  searchSuggestions,
  onSuggestionClick,
  recentSearches,
  onRecentSearchClick,
  onClearHistory
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop with blur */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100 animate-fadeIn'
        }`}
        onClick={handleClose}
      />

      {/* Modal Content - Takes top 65% */}
      <div 
        className={`absolute top-0 left-0 right-0 h-[65vh] bg-white rounded-b-[32px] shadow-2xl overflow-hidden ${
          isClosing ? 'animate-slideDown' : 'animate-slideUp'
        }`}
      >
        {/* Decorative gradient header */}
        <div className="h-2 bg-gradient-to-l from-blue-500 via-blue-600 to-blue-700" />
        
        {/* Search Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="relative">
            {/* Modern Search Input */}
            <div className="relative flex items-center">
              <div className="absolute right-4 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="جستجوی محصول، برند یا دسته‌بندی..."
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-14 pr-12 py-4 text-gray-700 text-base focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                value={searchQuery}
                onChange={onSearchInputChange}
                onKeyDown={handleKeyDown}
              />
              <button 
                onClick={onSearch}
                className="absolute left-2 bg-gradient-to-l from-blue-600 to-blue-700 text-white p-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 active:scale-95"
              >
                <FaSearchengin className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 scrollbar-hide" style={{ maxHeight: 'calc(65vh - 120px)' }}>
          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-800">دسته‌بندی‌های پیشنهادی</h4>
              </div>
              <div className="space-y-2">
                {searchSuggestions.map((suggestion, index) => {
                  // Display subcategory name and its parent category
                  return (
                    <button
                      key={suggestion.id || index}
                      onClick={() => onSuggestionClick(suggestion)}
                      className="stagger-item w-full flex items-center gap-4 p-4 bg-gradient-to-l from-blue-50 to-white rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 group active:scale-[0.98]"
                    >
                      <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 text-right">
                        <span className="block text-gray-700 text-sm font-medium">{suggestion.title}</span>
                        <span className="block text-xs text-gray-500 mt-1">دسته: {suggestion.categoryName}</span>
                      </div>
                      <FaArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:-translate-x-1 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <FaClockRotateLeft className="w-4 h-4 text-gray-500" />
                </div>
                <h4 className="font-semibold text-gray-800">جستجوهای اخیر</h4>
              </div>
              {recentSearches.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-red-500 text-sm font-medium hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  پاک کردن
                </button>
              )}
            </div>

            {recentSearches.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaClockRotateLeft className="text-gray-300 text-2xl" />
                </div>
                <p className="text-gray-400 text-sm">تاریخچه جستجو خالی است</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSearches.map((item, index) => {
                  const displayText = typeof item === 'object' ? (item.title || item.query) : item;
                  return (
                    <button
                      key={item.id || index}
                      onClick={() => onRecentSearchClick(item)}
                      className="stagger-item w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 group active:scale-[0.98]"
                    >
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <FaClockRotateLeft className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="flex-1 text-gray-600 text-sm text-right">{displayText}</span>
                      <FaArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:-translate-x-1 transition-all" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Close Button - Bottom center */}
      <div 
        className={`absolute bottom-[18%] left-1/2 transform -translate-x-1/2 ${
          isClosing ? 'animate-fadeOut' : 'animate-bounceIn'
        }`}
        style={{ animationDelay: isClosing ? '0s' : '0.2s' }}
      >
        <button
          onClick={handleClose}
          className="w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 border-2 border-gray-100"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
        <p className="text-white text-xs text-center mt-2 font-medium">بستن</p>
      </div>
    </div>
  );
};

export default SearchModal;