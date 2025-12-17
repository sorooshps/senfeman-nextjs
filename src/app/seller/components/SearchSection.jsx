"use client";

import { FaSearchengin, FaClockRotateLeft, FaTrash, FaArrowRight } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";
import SearchInput from "./SearchInput";
import SearchSuggestions from "./SearchSuggestions";
import RecentSearches from "./RecentSearches";

const SearchSection = ({
  searchQuery,
  onSearchInputChange,
  onSearchInputFocus,
  onSearchInputBlur,
  onSearch,
  showSearchHistory,
  searchSuggestions,
  recentSearches,
  showMore,
  onSuggestionClick,
  onRecentSearchClick,
  onDeleteSearch,
  onClearHistory,
  onShowMoreToggle,
  mobile,
  onSearchInputClick
}) => {
  if (mobile) {
    return (
      <div className="max-w-2xl mx-auto mb-6">
        <SearchInput
          value={searchQuery}
          onChange={onSearchInputChange}
          onFocus={onSearchInputFocus}
          onBlur={onSearchInputBlur}
          onClick={onSearchInputClick}
          onSearch={onSearch}
          mobile={true}
          readOnly={true}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 mx-15">
        <SearchInput
          value={searchQuery}
          onChange={onSearchInputChange}
          onFocus={onSearchInputFocus}
          onBlur={onSearchInputBlur}
          onSearch={onSearch}
          mobile={false}
        />
      </div>

      {showSearchHistory && (
        <div className="mb-8 mx-15">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <SearchSuggestions
              suggestions={searchSuggestions}
              onSuggestionClick={onSuggestionClick}
            />
            <RecentSearches
              recentSearches={recentSearches}
              showMore={showMore}
              onRecentSearchClick={onRecentSearchClick}
              onDeleteSearch={onDeleteSearch}
              onClearHistory={onClearHistory}
              onShowMoreToggle={onShowMoreToggle}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SearchSection;