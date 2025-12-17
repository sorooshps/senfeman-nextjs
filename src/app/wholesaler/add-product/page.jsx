'use client';
import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Layout from '../../../components/Layout';
import SingleProductContent from './components/SingleProductContent';
import CategoriesContent from './components/CategoriesContent';
import { useAddProduct } from './hooks/useAddProduct';

const NewProductPage = () => {
    const [productType, setProductType] = useState('categories');
    const { isAuthenticated, loading, error } = useAuth('wholesaler');

    // Use the custom hook for API integration
    const addProductHook = useAddProduct();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    if (!isAuthenticated) {
      return null; // Hook handles redirect
    }

  const categorySteps = [
    { name: 'category', label: 'دسته‌بندی کلی', count: '۰۱' },
    { name: 'subcategory', label: 'دسته‌بندی فرعی', count: '۰۲' },
    { name: 'brand', label: 'برند محصول', count: '۰۳' },
  ];

  return (
    <Layout>
      <div className="py-6 bg-gray-100 min-h-screen" dir="rtl">
        {/* Product Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-xl font-semibold text-gray-800 mb-6">نوع ثبت محصولات</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label
              className={`flex items-start p-6 rounded-lg border-2 cursor-pointer transition ${
                productType === 'single' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setProductType('single')}
            >
              <input type="radio" checked={productType === 'single'} readOnly className="mt-1 w-5 h-5 text-blue-600" />
              <div className="mr-4">
                <h3 className="font-semibold text-gray-800">افزودن تکی محصول</h3>
                <p className="text-sm text-gray-600 mt-1">انتخاب تکی و جزئی برای ثبت موجودی کالای مشخص</p>
              </div>
            </label>

            <label
              className={`flex items-start p-6 rounded-lg border-2 cursor-pointer transition ${
                productType === 'categories' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setProductType('categories')}
            >
              <input type="radio" checked={productType === 'categories'} readOnly className="mt-1 w-5 h-5 text-blue-600" />
              <div className="mr-4">
                <h3 className="font-semibold text-gray-800">افزودن دسته‌ای محصولات</h3>
                <p className="text-sm text-gray-600 mt-1">انتخاب کلی و دسته‌ای برای ثبت موجودی گروهی از کالاها</p>
              </div>
            </label>
          </div>
        </div>

        {/* Content */}
        {productType === 'single' ? (
          <SingleProductContent />
        ) : (
          <CategoriesContent
            // API data from hook
            categories={addProductHook.categories}
            subcategories={addProductHook.subcategories}
            brands={addProductHook.brands}
            products={addProductHook.products}
            colors={addProductHook.colors}
            // Loading states
            loadingCategories={addProductHook.loadingCategories}
            loadingBrands={addProductHook.loadingBrands}
            loadingProducts={addProductHook.loadingProducts}
            loadingColors={addProductHook.loadingColors}
            submitting={addProductHook.submitting}
            // Selections from hook
            selectedCategory={addProductHook.selectedCategory}
            selectedSubcategory={addProductHook.selectedSubcategory}
            selectedBrand={addProductHook.selectedBrand}
            selectedProducts={addProductHook.selectedProducts}
            selectedColors={addProductHook.selectedColors}
            // Step state
            activeStep={addProductHook.activeStep}
            setActiveStep={addProductHook.setActiveStep}
            // Handlers from hook
            handleCategorySelect={addProductHook.handleCategorySelect}
            handleSubcategorySelect={addProductHook.handleSubcategorySelect}
            handleBrandSelect={addProductHook.handleBrandSelect}
            handleProductToggle={addProductHook.handleProductToggle}
            handleColorToggle={addProductHook.handleColorToggle}
            handleStepClick={addProductHook.handleStepClick}
            handleSubmit={addProductHook.handleSubmit}
            canProceed={addProductHook.canProceed}
            error={addProductHook.error}
            // UI config
            categorySteps={categorySteps}
          />
        )}
      </div>
    </Layout>
  );
};

export default NewProductPage;