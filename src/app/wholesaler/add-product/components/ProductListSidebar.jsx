"use client";

import { FaCube, FaGlobe, FaTag, FaPalette } from 'react-icons/fa';

const ProductListSidebar = ({
  selectedCategory,
  selectedSubcategory,
  selectedBrand,
  selectedProducts = [],
  selectedColors = [],
  activeStep,
  categorySteps,
  canProceed,
  submitting,
  onSubmit,
  setActiveStep
}) => {
  const handleNextStep = () => {
    if (activeStep === 'brand') {
      onSubmit();
    } else {
      const currentIndex = categorySteps.findIndex(s => s.name === activeStep);
      const nextStep = categorySteps[currentIndex + 1];
      if (nextStep) {
        setActiveStep(nextStep.name);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 pr-2">لیست محصولات</h2>
      <div className="flex-1 border-t border-gray-200 pt-4 space-y-3 text-sm">
        {selectedCategory && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <FaCube className="inline ml-2 text-blue-500" />
            دسته‌بندی: {selectedCategory.name}
          </div>
        )}
        {selectedSubcategory && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <FaCube className="inline ml-2 text-green-500" />
            دسته فرعی: {selectedSubcategory.name}
          </div>
        )}
        {selectedBrand && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <FaGlobe className="inline ml-2 text-purple-500" />
            برند: {selectedBrand.name}
          </div>
        )}
        {selectedProducts.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <FaTag className="inline ml-2 text-orange-500" />
            محصولات: {selectedProducts.length} مورد
          </div>
        )}
        {selectedColors.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <FaPalette className="inline ml-2 text-pink-500" />
            رنگ‌ها: {selectedColors.map(c => c.name).join('، ')}
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t" dir="ltr">
        <button
          onClick={handleNextStep}
          disabled={!canProceed || submitting}
          className={`px-8 py-2 rounded-lg font-medium transition ${
            canProceed && !submitting ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        >
          {submitting ? 'در حال ثبت...' : activeStep === 'brand' ? 'ثبت نهایی' : 'ادامه'}
        </button>
        <button className="px-8 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">انصراف</button>
      </div>
    </div>
  );
};

export default ProductListSidebar;