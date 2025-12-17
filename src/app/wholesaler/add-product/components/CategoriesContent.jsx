"use client";

import CategoryStepIndicator from './CategoryStepIndicator';
import SubCategorySelection from './SubCategorySelection';
import BrandSelection from './BrandSelection';
import ProductListSidebar from './ProductListSidebar';

const CategoriesContent = ({
  // API data
  categories,
  subcategories,
  brands,
  products,
  colors,
  // Loading states
  loadingCategories,
  loadingBrands,
  loadingProducts,
  loadingColors,
  submitting,
  // Selections
  selectedCategory,
  selectedSubcategory,
  selectedBrand,
  selectedProducts,
  selectedColors,
  // Step state
  activeStep,
  setActiveStep,
  // Handlers
  handleCategorySelect,
  handleSubcategorySelect,
  handleBrandSelect,
  handleProductToggle,
  handleColorToggle,
  handleStepClick,
  handleSubmit,
  canProceed,
  error,
  // UI config
  categorySteps,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800">موجودی دسته‌ای محصولات</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="mb-8 lg:border lg:border-gray-200 lg:rounded-2xl lg:p-5">
            <CategoryStepIndicator steps={categorySteps} activeStepName={activeStep} onStepClick={handleStepClick} />
          </div>

          {activeStep === 'category' && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingCategories ? (
                <div className="col-span-full text-center py-8 text-gray-500">در حال بارگذاری...</div>
              ) : categories.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">دسته‌بندی یافت نشد</div>
              ) : (
                categories.map((category) => {
                  const isSel = selectedCategory?.id === category.id;
                  return (
                    <label
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                        isSel ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm">{category.name}</span>
                      <input type="radio" checked={isSel} readOnly className="w-5 h-5 text-blue-600" />
                    </label>
                  );
                })
              )}
            </div>
          )}

          {activeStep === 'subcategory' && (
            <SubCategorySelection
              selectedCategoryName={selectedCategory?.name}
              subcategories={subcategories}
              selectedSubcategory={selectedSubcategory}
              onSubcategorySelect={handleSubcategorySelect}
            />
          )}

          {activeStep === 'brand' && (
            <BrandSelection
              brands={brands}
              loadingBrands={loadingBrands}
              selectedBrand={selectedBrand}
              onBrandSelect={handleBrandSelect}
            />
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <ProductListSidebar
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          selectedBrand={selectedBrand}
          selectedProducts={selectedProducts}
          selectedColors={selectedColors}
          activeStep={activeStep}
          categorySteps={categorySteps}
          canProceed={canProceed}
          submitting={submitting}
          onSubmit={handleSubmit}
          setActiveStep={setActiveStep}
        />
      </div>
    </div>
  );
};

export default CategoriesContent;