"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getCategories,
  getBrandsBySubcategory,
  getColors,
  searchProducts,
  addWholesalerCategoryProduct,
} from '../../../../api/wholesaler';

export const useAddProduct = () => {
  // Auth token
  const [token, setToken] = useState(null);

  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingColors, setLoadingColors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data states
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);

  // Selection states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  // Step state
  const [activeStep, setActiveStep] = useState('category');

  // Error state
  const [error, setError] = useState(null);

  // Get token on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access');
    console.log('[useAddProduct] Token from localStorage:', accessToken ? 'found' : 'not found');
    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    if (!token) {
      console.log('[useAddProduct] No token, skipping categories fetch');
      return;
    }

    const fetchCategories = async () => {
      console.log('[useAddProduct] Fetching categories...');
      setLoadingCategories(true);
      setError(null);
      try {
        const response = await getCategories(token);
        console.log('[useAddProduct] Categories response:', response);
        // Response has pagination: { count, next, previous, results }
        const categoriesData = response.results || response;
        console.log('[useAddProduct] Categories data:', categoriesData);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('[useAddProduct] Failed to fetch categories:', err);
        setError('خطا در دریافت دسته‌بندی‌ها: ' + err.message);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [token]);

  // Fetch brands when subcategory changes
  useEffect(() => {
    if (!token || !selectedSubcategory) {
      setBrands([]);
      return;
    }

    const fetchBrands = async () => {
      setLoadingBrands(true);
      setError(null);
      try {
        const response = await getBrandsBySubcategory(selectedSubcategory.id, token);
        setBrands(response.results || response);
      } catch (err) {
        console.error('Failed to fetch brands:', err);
        setError('خطا در دریافت برندها');
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, [token, selectedSubcategory]);

  // Fetch products when brand changes
  useEffect(() => {
    if (!token || !selectedSubcategory || !selectedBrand) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoadingProducts(true);
      setError(null);
      try {
        const response = await searchProducts(
          { scategory: selectedSubcategory.id, brand: selectedBrand.id },
          token
        );
        setProducts(response.results || response);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('خطا در دریافت محصولات');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [token, selectedSubcategory, selectedBrand]);

  // Fetch colors on mount
  useEffect(() => {
    if (!token) return;

    const fetchColors = async () => {
      setLoadingColors(true);
      try {
        const response = await getColors(token);
        setColors(response.results || response);
      } catch (err) {
        console.error('Failed to fetch colors:', err);
      } finally {
        setLoadingColors(false);
      }
    };

    fetchColors();
  }, [token]);

  // Handle category selection
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSelectedBrand(null);
    setSelectedProducts([]);
    setSelectedColors([]);
    setActiveStep('subcategory');
  }, []);

  // Handle subcategory selection
  const handleSubcategorySelect = useCallback((subcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedBrand(null);
    setSelectedProducts([]);
    setSelectedColors([]);
    setActiveStep('brand');
  }, []);

  // Handle brand selection
  const handleBrandSelect = useCallback((brand) => {
    setSelectedBrand(brand);
    setSelectedProducts([]);
    setSelectedColors([]);
    // Removed features step - brand is the final step
  }, []);

  // Handle product selection (toggle)
  const handleProductToggle = useCallback((product) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  // Handle color selection (toggle)
  const handleColorToggle = useCallback((color) => {
    setSelectedColors((prev) => {
      const exists = prev.find((c) => c.id === color.id);
      if (exists) {
        return prev.filter((c) => c.id !== color.id);
      }
      return [...prev, color];
    });
  }, []);

  // Handle step click (navigation)
  const handleStepClick = useCallback((stepName) => {
    const stepOrder = ['category', 'subcategory', 'brand'];
    const currentIndex = stepOrder.indexOf(activeStep);
    const targetIndex = stepOrder.indexOf(stepName);

    // Can only go back or stay at current step
    if (targetIndex <= currentIndex) {
      setActiveStep(stepName);
    }
  }, [activeStep]);

  // Submit the form
  const handleSubmit = useCallback(async () => {
    if (!token || !selectedSubcategory) {
      setError('لطفا دسته‌بندی را انتخاب کنید');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Ensure we're sending valid data
      const data = {
        sCategory: selectedSubcategory.id,
        // If no brand is selected, send empty array
      };
      
      // Only add brands field if we have a selected brand
      if (selectedBrand) {
        data.brands = [selectedBrand.id];
      }

      console.log('Submitting category product data:', data);
      await addWholesalerCategoryProduct(data, token);
      
      // Reset form on success
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSelectedBrand(null);
      setSelectedProducts([]);
      setSelectedColors([]);
      setActiveStep('category');

      return { success: true };
    } catch (err) {
      console.error('Failed to submit:', err);
      setError(err.message || 'خطا در ثبت محصول');
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  }, [token, selectedSubcategory, selectedBrand]);

  // Get subcategories for selected category
  const subcategories = selectedCategory?.subCategories || [];

  // Check if can proceed to next step
  const canProceed =
    (activeStep === 'subcategory' && selectedSubcategory) ||
    (activeStep === 'brand' && selectedBrand);

  return {
    // Loading states
    loadingCategories,
    loadingBrands,
    loadingProducts,
    loadingColors,
    submitting,

    // Data
    categories,
    subcategories,
    brands,
    products,
    colors,

    // Selections
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    selectedProducts,
    selectedColors,

    // Step
    activeStep,
    canProceed,

    // Error
    error,

    // Handlers
    handleCategorySelect,
    handleSubcategorySelect,
    handleBrandSelect,
    handleProductToggle,
    handleColorToggle,
    handleStepClick,
    handleSubmit,
    setActiveStep,
  };
};
