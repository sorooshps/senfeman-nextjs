"use client";

import { FaArrowRight } from 'react-icons/fa';

const SubCategorySelection = ({
  selectedCategoryName,
  subcategories = [],
  selectedSubcategory,
  onSubcategorySelect,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-2">
        <FaArrowRight className="text-gray-700 text-lg" />
        <h3 className="text-md font-semibold text-gray-800 ml-2">
          انتخاب دسته‌بندی فرعی :{' '}
          <span className="text-blue-500 mr-2">{selectedCategoryName}</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {subcategories.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">زیردسته‌بندی یافت نشد</div>
        ) : (
          subcategories.map((sub) => {
            const isSelected = selectedSubcategory?.id === sub.id;
            return (
              <div
                key={sub.id}
                onClick={() => onSubcategorySelect(sub)}
                className={`flex flex-col items-center p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="w-20 h-20 bg-gray-100 rounded mb-3"></div>
                <span className={`text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                  {sub.name}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SubCategorySelection;