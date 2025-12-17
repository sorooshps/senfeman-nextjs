"use client";

import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaCheck } from 'react-icons/fa';

const ProductFeaturesStep = ({
  products = [],
  colors = [],
  loadingProducts,
  loadingColors,
  selectedProducts = [],
  selectedColors = [],
  onProductToggle,
  onColorToggle,
  selectedBrand,
  selectedSubcategory,
}) => {
  // All sections open by default — user can open/close independently
  const [openSections, setOpenSections] = useState({
    products: true,
    colors: true,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Color dot mapping for visual display
  const colorDotMap = {
    'مشکی': 'bg-[#1E1E1E]',
    'قرمز': 'bg-[#FF4D4D]',
    'صورتی': 'bg-[#E94DFF]',
    'جیگری': 'bg-[#D04DFF]',
    'زرد': 'bg-[#FFC64D]',
    'سبز': 'bg-[#4DFF8E]',
    'سفید': 'bg-white border border-gray-400',
    'آبی': 'bg-[#4D9FFF]',
    'نقره‌ای': 'bg-[#C0C0C0]',
    'طلایی': 'bg-[#FFD700]',
  };

  const getColorDot = (colorName) => {
    return colorDotMap[colorName] || 'bg-gray-400';
  };

  return (
    <div className="mt-6">
      {/* Two Independent Collapsible Sections */}
      <div className="space-y-6">

        {/* محصولات (Products/Slugs) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('products')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <h3 className="text-lg font-bold text-gray-800">محصولات</h3>
            {openSections.products ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
          </button>
          {openSections.products && (
            <div className="px-6 pb-6 pt-2 space-y-4 max-h-64 overflow-y-auto">
              {loadingProducts ? (
                <div className="text-center py-4 text-gray-500">در حال بارگذاری محصولات...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-4 text-gray-500">محصولی یافت نشد</div>
              ) : (
                products.map((product) => {
                  const isSelected = selectedProducts.some(p => p.id === product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => onProductToggle(product)}
                      className="flex items-center gap-4 cursor-pointer group"
                    >
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}>
                        {isSelected && <FaCheck className="text-white text-sm" />}
                      </div>
                      <div className="flex-1">
                        <span className={`text-base ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {product.title}
                        </span>
                        <span className="text-xs text-gray-400 mr-2">({product.slug})</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* رنگ‌ها (Colors) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('colors')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <h3 className="text-lg font-bold text-gray-800">رنگ محصول</h3>
            {openSections.colors ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
          </button>
          {openSections.colors && (
            <div className="px-6 pb-6 pt-2">
              {loadingColors ? (
                <div className="text-center py-4 text-gray-500">در حال بارگذاری رنگ‌ها...</div>
              ) : colors.length === 0 ? (
                <div className="text-center py-4 text-gray-500">رنگی یافت نشد</div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {colors.map((color) => {
                    const isSelected = selectedColors.some(c => c.id === color.id);
                    const dotClass = getColorDot(color.name);
                    return (
                      <div
                        key={color.id}
                        onClick={() => onColorToggle(color)}
                        className={`
                          flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all
                          ${isSelected
                              ? 'bg-white border-2 border-blue-600 shadow-md shadow-blue-200/50'
                              : 'bg-gray-50 border border-gray-300 hover:border-blue-400'
                          }
                        `}
                      >
                        <div className={`w-5 h-5 rounded-full ${dotClass} flex items-center justify-center`}>
                          {isSelected && color.name !== 'سفید' && <FaCheck className="text-white text-xs" />}
                          {isSelected && color.name === 'سفید' && <FaCheck className="text-blue-600 text-xs" />}
                        </div>
                        <span className={`text-sm whitespace-nowrap ${isSelected ? 'font-semibold text-blue-800' : 'text-gray-700'}`}>
                          {color.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductFeaturesStep;