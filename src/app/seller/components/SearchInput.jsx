"use client";

import { FaSearchengin } from "react-icons/fa6";
import { Search, Sparkles } from "lucide-react";

const SearchInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
  onSearch,
  onClick,
  mobile,
  readOnly = false
}) => {
  if (mobile) {
    return (
      <div 
        onClick={onClick}
        className="relative cursor-pointer group"
      >
        {/* Animated border gradient on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-l from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 blur-sm" />
        
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 px-5 py-2 flex items-center gap-4 group-hover:shadow-xl transition-all duration-300">
          {/* Search icon with animated background */}
          
          
          <div className="flex-1">
            <p className="text-gray-400 text-sm">جستجوی دسته‌بندی محصولات...</p>
          </div>
          
          {/* Sparkle indicator */}
          <div className="flex items-center gap-1 bg-blue-600 p-2 rounded-xl text-white">
            <Search className="w-7 h-7 animate-pulse-slow" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex-1 relative group">
        {/* Subtle glow effect on focus */}
        <div className="absolute -inset-1 bg-gradient-to-l from-blue-400 to-blue-600 rounded-2xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 blur-lg" />
        
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="نام دسته‌بندی مورد نظر خود را جستجو کنید..."
            className="w-full bg-white border-2 border-gray-200 text-gray-700 focus:outline-none text-base rounded-2xl px-5 py-4 pr-12 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg placeholder:text-gray-400"
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onClick={onClick}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            readOnly={readOnly}
          />
        </div>
      </div>
      <button 
        onClick={onSearch}
        className="bg-gradient-to-l from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md flex items-center gap-2 font-semibold"
      >
        <FaSearchengin className="text-lg" />
        جستجو
      </button>
    </div>
  );
};

export default SearchInput;