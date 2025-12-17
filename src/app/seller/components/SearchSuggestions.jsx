"use client";

import React from "react";
import { FaSearchengin, FaArrowRight } from "react-icons/fa6";

const SearchSuggestions = ({ suggestions, onSuggestionClick }) => {
  if (!suggestions.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FaSearchengin className="text-blue-500" />
        <span className="font-medium text-gray-700">پیشنهادات جستجو</span>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => {
          // Handle both string and object formats
          const displayText = typeof suggestion === 'object' ? suggestion.title : suggestion;
          
          return (
            <button
              key={suggestion.id || index}
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group text-right border border-blue-100"
            >
              <div className="flex items-center gap-3">
                <FaSearchengin className="text-blue-400" />
                <span className="text-gray-700 text-sm">{displayText}</span>
              </div>
              <FaArrowRight className="text-blue-400 group-hover:text-blue-600" />
            </button>
          );
        })}
      </div>
      <div className="border-t border-gray-200 mt-4 pt-4"></div>
    </div>
  );
};

export default SearchSuggestions;