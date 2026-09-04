import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiFilter,
  FiX,
  FiCheck,
  FiShoppingCart,
  FiAward,
} from 'react-icons/fi';
import productService from '../services/productService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Input from '../components/ui/Input';
import { formatCurrency, getProductImage, DEFAULT_LAPTOP_IMAGE } from '../utils/helpers';
import { useCartStore } from '../store/cartStore';
import { useComparisonStore } from '../store/comparisonStore';
import api from '../services/api';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { addProduct, removeProduct, isInComparison, products: comparisonProducts } = useComparisonStore();

  // Extract query params as single source of truth
  const brandParam = searchParams.get('brand') || '';
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const ramParam = searchParams.get('ram') || '';
  const storageParam = searchParams.get('storage') || '';
  const processorParam = searchParams.get('processor') || '';
  const sortParam = searchParams.get('sort') || 'createdAt';
  const orderParam = searchParams.get('order') || 'desc';
  const pageParam = parseInt(searchParams.get('page') || '1');

  // Filter states initialized from searchParams
  const [filters, setFilters] = useState({
    search: searchParam,
    brand: brandParam,
    category: categoryParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    ram: ramParam,
    storage: storageParam,
    processor: processorParam,
    sort: sortParam,
    order: orderParam,
    page: pageParam,
    limit: 12,
  });

  const [showFilters, setShowFilters] = useState(true);

  // Sync state whenever URL searchParams change (supports browser back/forward and external brand links)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParam,
      brand: brandParam,
      category: categoryParam,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
      ram: ramParam,
      storage: storageParam,
      processor: processorParam,
      sort: sortParam,
      order: orderParam,
      page: pageParam,
    }));
  }, [
    searchParam,
    brandParam,
    categoryParam,
    minPriceParam,
    maxPriceParam,
    ramParam,
    storageParam,
    processorParam,
    sortParam,
    orderParam,
    pageParam,
  ]);

  // Fetch brands
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () =>
      api.get('/brands').then((res: any) => res.data || res),
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      api.get('/categories').then((res: any) => res.data || res),
  });

  // Fetch products with active filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
  });

  // Active brand helper object
  const activeBrandObj = useMemo(() => {
    if (!filters.brand || !brands) return null;
    const lower = filters.brand.toLowerCase();
    return brands.find(
      (b: any) =>
        b.id === filters.brand ||
        b.slug?.toLowerCase() === lower ||
        b.name?.toLowerCase() === lower
    );
  }, [filters.brand, brands]);

  // Update query params when user changes filters
  const handleFilterChange = (key: string, value: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '') {
      newParams.set(key, String(value));
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // 1-Click Brand Selector (Jumia Official Store Style)
  const handleSelectBrand = (brandSlugOrAll: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (brandSlugOrAll && brandSlugOrAll !== 'all') {
      newParams.set('brand', brandSlugOrAll);
    } else {
      newParams.delete('brand');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: getProductImage(product),
      quantity: 1,
      stock: product.stock,
    });
    toast.success(
      (t) => (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span>Added <strong>{product.name}</strong> to cart!</span>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/cart');
            }}
            className="px-3 py-1 bg-amber-500 text-gray-950 font-bold rounded-lg hover:bg-amber-400 text-xs shadow-sm whitespace-nowrap"
          >
            View Cart
          </button>
        </div>
      ),
      { duration: 4000 }
    );
  };

  const handleToggleCompare = (product: any) => {
    if (isInComparison(product.id)) {
      removeProduct(product.id);
      toast.success(`Removed ${product.name} from comparison.`);
    } else {
      if (comparisonProducts.length >= 4) {
        toast.error('You can compare up to 4 laptops at once.');
        return;
      }
      addProduct(product);
      toast.success(
        (t) => (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span>Added to comparison ({comparisonProducts.length + 1}/4)</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/compare');
              }}
              className="px-2.5 py-1 bg-primary-600 text-white font-bold rounded hover:bg-primary-700 text-xs shadow-sm whitespace-nowrap"
            >
              Compare Now
            </button>
          </div>
        ),
        { duration: 4000 }
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ramOptions = ['4', '8', '16', '32', '64'];
  const storageOptions = ['128', '256', '512', '1024', '2048'];
  const processorOptions = [
    'Intel Core i3',
    'Intel Core i5',
    'Intel Core i7',
    'Intel Core i9',
    'AMD Ryzen 3',
    'AMD Ryzen 5',
    'AMD Ryzen 7',
    'AMD Ryzen 9',
    'Apple M1',
    'Apple M2',
    'Apple M3',
  ];

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'averageRating-desc', label: 'Highest Rated' },
    { value: 'salesCount-desc', label: 'Best Selling' },
  ];

  const activeFiltersCount = [
    filters.brand,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.ram,
    filters.storage,
    filters.processor,
  ].filter(Boolean).length;

  return (
    <>
      <Helmet>
        <title>{activeBrandObj ? `${activeBrandObj.name} Laptops - Apexbyte Shop` : 'Shop Laptops - Apexbyte Store'}</title>
        <meta
          name="description"
          content="Browse our extensive collection of premium laptops. Filter by brand, price, specs, and more. Fast delivery across Kenya."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Jumia-Style Official Brand Stores Strip */}
        <div className="bg-gray-900 text-white py-3 border-b border-gray-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FiAward className="text-amber-400" size={16} />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Official Brand Stores
                </span>
                <span className="text-[11px] text-gray-400 hidden sm:inline">
                  • 100% Genuine Laptops with Full Manufacturer Warranty
                </span>
              </div>
              {activeBrandObj && (
                <button
                  type="button"
                  onClick={() => handleSelectBrand('all')}
                  className="text-xs text-amber-300 hover:text-white flex items-center gap-1 font-semibold transition-colors bg-white/10 px-2 py-0.5 rounded"
                >
                  <FiX size={13} /> Clear {activeBrandObj.name} Filter
                </button>
              )}
            </div>

            {/* Brand Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => handleSelectBrand('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 shadow-sm ${
                  !filters.brand
                    ? 'bg-amber-500 text-gray-950 shadow-amber-500/20'
                    : 'bg-white/10 text-gray-200 hover:bg-white/20 hover:text-white'
                }`}
              >
                All Brands
              </button>
              {brands?.map((b: any) => {
                const isSelected =
                  filters.brand === b.id ||
                  filters.brand.toLowerCase() === b.slug?.toLowerCase() ||
                  filters.brand.toLowerCase() === b.name?.toLowerCase();
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBrand(b.slug || b.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm ${
                      isSelected
                        ? 'bg-amber-500 text-gray-950 shadow-amber-500/20 ring-2 ring-amber-300'
                        : 'bg-white/10 text-gray-200 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <span>{b.name}</span>
                    {isSelected && <FiCheck size={13} className="text-gray-950 font-black" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {activeBrandObj ? `${activeBrandObj.name} Laptops` : 'Laptop Catalog'}
                  </h1>
                  {activeBrandObj && (
                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <FiAward size={12} /> Official Store
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  {productsData?.pagination?.total !== undefined ? `${productsData.pagination.total} laptop models found` : 'Loading laptops...'}
                  {activeBrandObj && ` • Filtered by ${activeBrandObj.name}`}
                </p>
              </div>

              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter className="mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {activeFiltersCount > 0 && (
                  <Badge variant="primary" size="sm" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <AnimatePresence>
              {(showFilters || window.innerWidth >= 1024) && (
                <motion.aside
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="lg:col-span-1"
                >
                  <Card className="sticky top-4">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <FiFilter size={18} /> Filters
                      </h2>
                      {activeFiltersCount > 0 && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="text-xs text-primary-600 hover:underline font-bold"
                        >
                          Reset All
                        </button>
                      )}
                    </div>

                    <div className="space-y-6">
                      {/* Search */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                          Keyword Search
                        </label>
                        <Input
                          type="text"
                          placeholder="Search Core i5, Dell XPS, etc."
                          value={filters.search}
                          onChange={(e) =>
                            handleFilterChange('search', e.target.value)
                          }
                        />
                      </div>

                      {/* Brand Dropdown / List */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                          Brand
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500"
                          value={activeBrandObj?.slug || filters.brand}
                          onChange={(e) =>
                            handleFilterChange('brand', e.target.value)
                          }
                        >
                          <option value="">All Brands</option>
                          {brands?.map((brand: any) => (
                            <option key={brand.id} value={brand.slug || brand.id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                          Category
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500"
                          value={filters.category}
                          onChange={(e) =>
                            handleFilterChange('category', e.target.value)
                          }
                        >
                          <option value="">All Categories</option>
                          {categories?.map((category: any) => (
                            <option key={category.id} value={category.slug || category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Price Range (KSh) */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                          Price Range (KSh)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="Min KSh"
                            value={filters.minPrice}
                            onChange={(e) =>
                              handleFilterChange('minPrice', e.target.value)
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Max KSh"
                            value={filters.maxPrice}
                            onChange={(e) =>
                              handleFilterChange('maxPrice', e.target.value)
                            }
                          />
                        </div>
                      </div>

                      {/* RAM */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                          RAM Capacity
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {ramOptions.map((ram) => {
                            const isSelected = filters.ram === ram;
                            return (
                              <button
                                key={ram}
                                type="button"
                                onClick={() =>
                                  handleFilterChange('ram', isSelected ? '' : ram)
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                  isSelected
                                    ? 'bg-primary-600 border-primary-600 text-white shadow'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-500'
                                }`}
                              >
                                {ram}GB
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Storage */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                          Storage (SSD)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {storageOptions.map((storage) => {
                            const isSelected = filters.storage === storage;
                            const label = parseInt(storage) >= 1024 ? `${parseInt(storage) / 1024}TB` : `${storage}GB`;
                            return (
                              <button
                                key={storage}
                                type="button"
                                onClick={() =>
                                  handleFilterChange('storage', isSelected ? '' : storage)
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                  isSelected
                                    ? 'bg-primary-600 border-primary-600 text-white shadow'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-500'
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Processor */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                          Processor
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500"
                          value={filters.processor}
                          onChange={(e) =>
                            handleFilterChange('processor', e.target.value)
                          }
                        >
                          <option value="">All Processors</option>
                          {processorOptions.map((proc) => (
                            <option key={proc} value={proc}>
                              {proc}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Card>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Products Grid Area */}
            <div className="lg:col-span-3">
              {/* Sort and Active Status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Sort by:
                  </span>
                  <select
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary-500"
                    value={`${filters.sort}-${filters.order}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('-');
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('sort', sort);
                      newParams.set('order', order);
                      newParams.set('page', '1');
                      setSearchParams(newParams);
                    }}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded border border-amber-200 dark:border-amber-800">
                      {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                    </span>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs text-gray-500 hover:text-red-600 underline"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Products Loading / Empty / Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <LoadingSkeleton key={i} />
                  ))}
                </div>
              ) : !productsData?.data || productsData.data.length === 0 ? (
                <Card className="text-center py-16">
                  <div className="text-6xl mb-4">💻</div>
                  <h3 className="text-2xl font-bold mb-2">No Laptops Found</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
                    {activeBrandObj
                      ? `We could not find any available laptops matching the "${activeBrandObj.name}" filter.`
                      : 'No laptops match your selected filters. Try broadening your criteria or reset all filters.'}
                  </p>
                  <Button onClick={handleResetFilters}>Reset All Filters</Button>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {productsData.data.map((product: any, index: number) => {
                      const discountPercent =
                        product.compareAtPrice && product.compareAtPrice > product.price
                          ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                          : null;

                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                        >
                          <Card className="group hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                            {/* Product Image & Badges */}
                            <Link to={`/products/${product.id}`} className="block relative">
                              <div className="aspect-square bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
                                <img
                                  src={getProductImage(product)}
                                  alt={product.name}
                                  onError={(e) => {
                                    e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                                  }}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />

                                {/* Discount Tag (Jumia style) */}
                                {discountPercent && discountPercent > 0 && (
                                  <div className="absolute top-2 left-2 bg-amber-500 text-gray-950 font-black text-xs px-2 py-0.5 rounded shadow">
                                    -{discountPercent}%
                                  </div>
                                )}

                                {/* Top Right Badges */}
                                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                  {product.isFeatured && (
                                    <Badge variant="primary" size="sm">
                                      Featured
                                    </Badge>
                                  )}
                                  {product.isNewArrival && (
                                    <Badge variant="success" size="sm">
                                      New
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Link>

                            {/* Content */}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                {/* Brand Name */}
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                                    {product.brand?.name || 'LAPTOP'}
                                  </span>
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    In Stock
                                  </span>
                                </div>

                                {/* Title */}
                                <Link to={`/products/${product.id}`}>
                                  <h3 className="font-bold text-gray-900 dark:text-white text-sm hover:text-primary-600 transition-colors line-clamp-2 mb-1.5 leading-snug">
                                    {product.name}
                                  </h3>
                                </Link>

                                {/* Specs Snippet */}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                                  {product.processor || ''} {product.ram ? `• ${product.ram}GB RAM` : ''} {product.storage ? `• ${product.storage}GB SSD` : ''}
                                </p>

                                {/* Rating */}
                                <div className="flex items-center gap-1.5 mb-3">
                                  <div className="flex text-amber-400 text-xs">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span
                                        key={star}
                                        className={
                                          star <= Math.round(product.averageRating || 5)
                                            ? 'text-amber-400'
                                            : 'text-gray-300'
                                        }
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-[11px] text-gray-500">
                                    ({product.reviewCount || 1})
                                  </span>
                                </div>
                              </div>

                              {/* Price & Action */}
                              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                                    {formatCurrency(product.price)}
                                  </span>
                                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatCurrency(product.compareAtPrice)}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stock === 0}
                                    className="flex-1 py-2 px-2.5 rounded-lg font-bold text-xs bg-amber-500 hover:bg-amber-600 text-gray-950 transition-colors flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wider"
                                  >
                                    <FiShoppingCart size={14} />
                                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCompare(product)}
                                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition-colors flex items-center justify-center whitespace-nowrap ${
                                      isInComparison(product.id)
                                        ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 font-bold'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 text-gray-600 dark:text-gray-300'
                                    }`}
                                    title={isInComparison(product.id) ? 'Remove from comparison' : 'Add to comparison'}
                                  >
                                    {isInComparison(product.id) ? '✓ Compared' : '+ Compare'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {productsData?.pagination && productsData.pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page === 1}
                        onClick={() => handlePageChange(filters.page - 1)}
                      >
                        Previous
                      </Button>

                      <span className="text-xs font-medium text-gray-500 px-3">
                        Page {filters.page} of {productsData.pagination.pages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page >= productsData.pagination.pages}
                        onClick={() => handlePageChange(filters.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Comparison Dock */}
      {comparisonProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-40 bg-gray-900 text-white dark:bg-gray-800 dark:text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-700 dark:border-gray-600 backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-black">
              {comparisonProducts.length}
            </span>
            <span className="text-xs sm:text-sm font-semibold">
              Laptop{comparisonProducts.length > 1 ? 's' : ''} in comparison
            </span>
          </div>
          <Link
            to="/compare"
            className="px-3.5 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-colors shadow flex items-center gap-1 whitespace-nowrap"
          >
            Compare Now →
          </Link>
        </motion.div>
      )}
    </>
  );
};

export default Shop;
