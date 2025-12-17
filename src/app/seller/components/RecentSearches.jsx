"use client";

import React from "react";
import { FaClockRotateLeft, FaTrash } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";

const RecentSearches = ({
  recentSearches = [],
  showMore,
  onRecentSearchClick,
  onDeleteSearch,
  onClearHistory,
  onShowMoreToggle
}) => (
  <>
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <FaClockRotateLeft className="text-orange-600 text-lg" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">جستجوهای اخیر</h3>
          <p className="text-sm text-gray-500">تاریخچه جستجوها</p>
        </div>
      </div>
      
      {recentSearches && recentSearches.length > 0 && (
        <button
          onClick={onClearHistory}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm transition-colors p-2 rounded-lg hover:bg-red-50"
        >
          <FaTrash className="text-sm" />
        </button>
      )}
    </div>

    {!recentSearches || recentSearches.length === 0 ? (
      <div className="text-center py-8">
        <FaClockRotateLeft className="text-gray-300 text-3xl mx-auto mb-3" />
        <p className="text-gray-500 text-sm">تاریخچه جستجو خالی است</p>
      </div>
    ) : (
      <div className="space-y-3">
        {recentSearches.slice(0, showMore ? recentSearches.length : 5).map((item, index) => {
          // Handle both string and object formats
          const displayText = typeof item === 'object' ? (item.title || item.query) : item;
          
          return (
            <div
              key={item.id || index}
              className="flex items-center justify-between group bg-gray-50 hover:bg-blue-50 rounded-xl p-3 transition-all duration-200 border border-transparent hover:border-blue-200 cursor-pointer"
              onClick={() => onRecentSearchClick && onRecentSearchClick(item)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 text-sm truncate">{displayText}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSearch(index);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 p-1 rounded-lg hover:bg-red-50 flex-shrink-0"
              >
                <IoIosClose size={20} />
              </button>
            </div>
          );
        })}
        
        {recentSearches.length > 5 && (
          <button
            onClick={onShowMoreToggle}
            className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {showMore ? 'نمایش کمتر' : `نمایش ${recentSearches.length - 5} مورد دیگر`}
          </button>
        )}
      </div>
    )}
  </>
);

export default RecentSearches;