import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiDollarSign,
  FiPackage,
  FiX,
  FiEye,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import brandService, { Brand } from '../../services/brandService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { formatCurrency, getProductImage } from '../../utils/helpers';

interface LaptopFormData {
  name: string;
  brandId: string;
  categoryId: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  costPrice?: string;
  stock: string;
  processor: string;
  processorBrand: 'INTEL' | 'AMD' | 'APPLE';
  processorGen?: string;
  ram: string;
  ramType: string;
  storage: string;
  storageType: string;
  gpu?: string;
  gpuBrand?: 'INTEL' | 'AMD' | 'NVIDIA' | 'APPLE';
  displaySize: string;
  displayResolution: string;
  displayType?: string;
  refreshRate?: string;
  color?: string;
  os: 'WINDOWS_11' | 'MACOS' | 'LINUX';
  batteryLife?: string;
  description: string;
  shortDescription?: string;
  images: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
}

const INITIAL_FORM: LaptopFormData = {
  name: '',
  brandId: '',
  categoryId: '',
  sku: '',
  price: '65000',
  compareAtPrice: '72000',
  stock: '10',
  processor: 'Intel Core i5-1135G7',
  processorBrand: 'INTEL',
  processorGen: '11th Generation',
  ram: '8',
  ramType: 'DDR4',
  storage: '512',
  storageType: 'SSD NVMe',
  gpu: 'Intel Iris Xe Graphics',
  gpuBrand: 'INTEL',
  displaySize: '14.0',
  displayResolution: '1920 x 1080',
  displayType: 'FHD IPS',
  refreshRate: '60',
  color: 'Dark Gray',
  os: 'WINDOWS_11',
  batteryLife: 'Up to 9 hours',
  description: 'High performance laptop equipped with modern processor, responsive high-speed SSD, and all-day battery life.',
  shortDescription: 'Core i5 | 8GB RAM | 512GB SSD | 14" FHD',
  images: ['/laptops/dell-vostro-natural.png'],
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
};

const AdminProducts = () => {
  const queryClient = useQueryClient();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickPriceOpen, setIsQuickPriceOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quickPrice, setQuickPrice] = useState<string>('');
  const [quickComparePrice, setQuickComparePrice] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<LaptopFormData>(INITIAL_FORM);
  const [imageInput, setImageInput] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch products
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products', currentPage, searchTerm, selectedBrand],
    queryFn: () =>
      productService.getProducts({
        page: currentPage,
        limit: 15,
        search: searchTerm || undefined,
        brandId: selectedBrand || undefined,
      }),
  });

  // Fetch Brands
  const { data: brands } = useQuery<Brand[]>({
    queryKey: ['admin-brands'],
    queryFn: () => brandService.getBrands(),
  });

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => productService.getCategories(),
  });

  const productsList = productsData?.data || [];
  const pagination = productsData?.pagination;

  // Create Laptop Mutation
  const createMutation = useMutation({
    mutationFn: (data: LaptopFormData) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create laptop product');
    },
  });

  // Update Laptop Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LaptopFormData> }) =>
      productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      closeModal();
      setIsQuickPriceOpen(false);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to update laptop');
    },
  });

  // Delete Laptop Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete product');
    },
  });

  const openCreateModal = () => {
    setSelectedProduct(null);
    setFormData({
      ...INITIAL_FORM,
      price: '54000',
      compareAtPrice: '62000',
      stock: '10',
      ram: '8',
      storage: '512',
      displaySize: '14.0',
      brandId: brands && brands.length > 0 ? brands[0].id : '',
      categoryId: categories && categories.length > 0 ? categories[0].id : '',
    });
    setImageInput('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      brandId: product.brandId || product.brand?.id || '',
      categoryId: product.categoryId || product.category?.id || '',
      sku: product.sku || '',
      price: product.price ? String(Math.round(Number(product.price))) : '',
      compareAtPrice: product.compareAtPrice && Number(product.compareAtPrice) > 0 ? String(Math.round(Number(product.compareAtPrice))) : '',
      costPrice: product.costPrice ? String(Math.round(Number(product.costPrice))) : '',
      stock: product.stock !== undefined && product.stock !== null ? String(product.stock) : '10',
      processor: product.processor || '',
      processorBrand: product.processorBrand || 'INTEL',
      processorGen: product.processorGen || '',
      ram: product.ram ? String(product.ram) : '8',
      ramType: product.ramType || 'DDR4',
      storage: product.storage ? String(product.storage) : '512',
      storageType: product.storageType || 'SSD',
      gpu: product.gpu || '',
      gpuBrand: product.gpuBrand || 'INTEL',
      displaySize: product.displaySize ? String(product.displaySize) : '14.0',
      displayResolution: product.displayResolution || '1920 x 1080',
      displayType: product.displayType || 'FHD IPS',
      refreshRate: product.refreshRate ? String(product.refreshRate) : '60',
      color: product.color || 'Dark Gray',
      os: product.os || 'WINDOWS_11',
      batteryLife: product.batteryLife || 'Up to 9 hours',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      images: Array.isArray(product.images) && product.images.length > 0
        ? product.images.map((img: any) => (typeof img === 'string' ? img : img.url))
        : ['/laptops/dell-vostro-natural.png'],
      isFeatured: !!product.isFeatured,
      isBestSeller: !!product.isBestSeller,
      isNewArrival: !!product.isNewArrival,
    });
    setImageInput('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openQuickPriceModal = (product: any) => {
    setSelectedProduct(product);
    setQuickPrice(product.price ? String(Math.round(Number(product.price))) : '');
    setQuickComparePrice(product.compareAtPrice && Number(product.compareAtPrice) > 0 ? String(Math.round(Number(product.compareAtPrice))) : '');
    setIsQuickPriceOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormError('');
  };

  const handleAddImage = () => {
    if (!imageInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageInput.trim()],
    }));
    setImageInput('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Laptop name is required');
      return;
    }
    const priceNum = Number(formData.price);
    if (!priceNum || priceNum <= 0) {
      setFormError('Valid price in KSh is required');
      return;
    }

    const payload = {
      ...formData,
      price: priceNum,
      compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
      stock: formData.stock ? Number(formData.stock) : 0,
      ram: formData.ram ? Number(formData.ram) : 8,
      storage: formData.storage ? Number(formData.storage) : 256,
      displaySize: formData.displaySize ? Number(formData.displaySize) : 14.0,
      refreshRate: formData.refreshRate ? Number(formData.refreshRate) : null,
    };

    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data: payload as any });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  const handleQuickPriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const priceNum = Number(quickPrice);
    if (!priceNum || priceNum <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    const compareNum = quickComparePrice ? Number(quickComparePrice) : null;

    updateMutation.mutate({
      id: selectedProduct.id,
      data: {
        price: priceNum,
        compareAtPrice: compareNum && compareNum > 0 ? compareNum : null,
      } as any,
    });
  };

  const handleDelete = (product: any) => {
    if (confirm(`Are you sure you want to delete laptop "${product.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(product.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiPackage className="text-primary-500" /> Laptop Inventory & Pricing Control
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add new laptops, edit prices in Kenyan Shillings, manage specs, and update natural product photos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/brands">
            <Button variant="outline">Manage Brands</Button>
          </Link>
          <Button onClick={openCreateModal} leftIcon={<FiPlus />}>
            Add New Laptop
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by laptop name or SKU..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Laptop Brands</option>
            {brands?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end text-sm text-gray-500 dark:text-gray-400">
          Showing {productsList.length} laptops (Page {currentPage})
        </div>
      </div>

      {/* Laptops Table */}
      {loadingProducts ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <LoadingSkeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : productsList.length === 0 ? (
        <Card className="text-center py-16">
          <FiPackage className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No laptops found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search filter or add a brand-new laptop to the catalog.
          </p>
          <Button onClick={openCreateModal} leftIcon={<FiPlus />}>
            Add New Laptop
          </Button>
        </Card>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3.5">Laptop Model</th>
                  <th className="px-4 py-3.5">Brand & Category</th>
                  <th className="px-4 py-3.5">Specs (CPU / RAM / SSD)</th>
                  <th className="px-4 py-3.5">Price (KSh)</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {productsList.map((product: any) => {
                  const mainImage = getProductImage(product);
                  const inStock = product.stock > 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      {/* Laptop Model & Image */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={mainImage}
                            alt={product.name}
                            className="w-14 h-14 rounded-lg object-cover bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '/laptops/dell-vostro-natural.png';
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-primary-600">
                              <Link to={`/products/${product.id}`} target="_blank">
                                {product.name}
                              </Link>
                            </h4>
                            <span className="text-xs text-gray-400 font-mono">
                              SKU: {product.sku}
                            </span>
                            <div className="flex items-center gap-1 mt-1">
                              {product.isFeatured && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium">
                                  Featured
                                </span>
                              )}
                              {product.isBestSeller && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                                  Best Seller
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Brand & Category */}
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.brand?.name || 'Generic'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.category?.name || 'Laptops'}
                        </div>
                      </td>

                      {/* Specs */}
                      <td className="px-4 py-4 text-xs">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.processor || 'Core i5'}
                        </div>
                        <div className="text-gray-500">
                          {product.ram}GB RAM • {product.storage}GB {product.storageType || 'SSD'}
                        </div>
                        <div className="text-gray-400 text-[11px]">
                          {product.displaySize}" {product.displayResolution}
                        </div>
                      </td>

                      {/* Price in KSh & Quick Edit */}
                      <td className="px-4 py-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-gray-900 dark:text-white text-base">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <div className="text-xs text-gray-400 line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </div>
                        )}
                        <button
                          onClick={() => openQuickPriceModal(product)}
                          className="text-xs text-primary-600 hover:text-primary-700 underline font-medium mt-1 flex items-center gap-1"
                        >
                          <FiDollarSign size={12} /> Edit Price
                        </button>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-4">
                        <Badge variant={inStock ? (product.stock <= 5 ? 'warning' : 'success') : 'error'}>
                          {inStock ? `${product.stock} in stock` : 'Out of stock'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/products/${product.id}`} target="_blank">
                            <button
                              title="View on site"
                              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <FiEye size={16} />
                            </button>
                          </Link>
                          <button
                            title="Edit full laptop details"
                            onClick={() => openEditModal(product)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            title="Delete laptop"
                            onClick={() => handleDelete(product)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} laptops total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= pagination.pages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Price Edit Modal */}
      <AnimatePresence>
        {isQuickPriceOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiDollarSign className="text-emerald-500" /> Edit Laptop Price
                </h3>
                <button
                  onClick={() => setIsQuickPriceOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                  {selectedProduct.name}
                </h4>
                <p className="text-xs text-gray-500">SKU: {selectedProduct.sku}</p>
              </div>

              <form onSubmit={handleQuickPriceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Selling Price (KES / KSh) *
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    placeholder="e.g. 54000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Compare At / Regular Price (KES / KSh)
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={quickComparePrice}
                    onChange={(e) => setQuickComparePrice(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Original price before discount, e.g. 62000"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsQuickPriceOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={updateMutation.isPending}>
                    Update Price
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Laptop Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedProduct ? `Edit Laptop: ${selectedProduct.name}` : 'Add New Laptop to Store'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure pricing in KES, processor, RAM, SSD, display, and natural photographs
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FiX size={24} />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Basic Info */}
                <div>
                  <h3 className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-3">
                    1. General Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Laptop Full Name / Model *
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Dell Vostro 14 (Core i5 11th Gen, 8GB, 512GB SSD)"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Brand *
                      </label>
                      <select
                        value={formData.brandId}
                        onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="">Select Brand</option>
                        {brands?.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories?.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        SKU (Stock Keeping Unit)
                      </label>
                      <Input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="e.g. DEL-VOSTRO-14-512"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Color
                      </label>
                      <Input
                        type="text"
                        value={formData.color || ''}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="e.g. Carbon Black, Silver, Midnight"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Pricing & Stock */}
                <div>
                  <h3 className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-3">
                    2. Pricing & Inventory (Kenyan Shillings - KSh)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Selling Price (KSh) *
                      </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="e.g. 54000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Original Price (KSh)
                      </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formData.compareAtPrice}
                        onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="e.g. 62000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Stock Quantity *
                      </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="e.g. 10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Hardware Specifications */}
                <div>
                  <h3 className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-3">
                    3. Hardware Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Processor (CPU) *
                      </label>
                      <Input
                        type="text"
                        value={formData.processor}
                        onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                        placeholder="e.g. Intel Core i5-1135G7"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        CPU Brand
                      </label>
                      <select
                        value={formData.processorBrand}
                        onChange={(e) => setFormData({ ...formData, processorBrand: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="INTEL">Intel</option>
                        <option value="AMD">AMD</option>
                        <option value="APPLE">Apple</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        CPU Generation
                      </label>
                      <Input
                        type="text"
                        value={formData.processorGen || ''}
                        onChange={(e) => setFormData({ ...formData, processorGen: e.target.value })}
                        placeholder="e.g. 11th Generation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        RAM Size (GB) *
                      </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formData.ram}
                        onChange={(e) => setFormData({ ...formData, ram: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="e.g. 8 or 16"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        RAM Type
                      </label>
                      <Input
                        type="text"
                        value={formData.ramType}
                        onChange={(e) => setFormData({ ...formData, ramType: e.target.value })}
                        placeholder="DDR4, DDR5, Unified"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Storage Size (GB) *
                      </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formData.storage}
                        onChange={(e) => setFormData({ ...formData, storage: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="e.g. 256, 512, 1000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Storage Type
                      </label>
                      <Input
                        type="text"
                        value={formData.storageType}
                        onChange={(e) => setFormData({ ...formData, storageType: e.target.value })}
                        placeholder="SSD NVMe, SSD, HDD"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Display Size (Inches)
                      </label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={formData.displaySize}
                        onChange={(e) => setFormData({ ...formData, displaySize: e.target.value.replace(/[^0-9.]/g, '') })}
                        placeholder="e.g. 14.0 or 15.6"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Display Resolution
                      </label>
                      <Input
                        type="text"
                        value={formData.displayResolution}
                        onChange={(e) => setFormData({ ...formData, displayResolution: e.target.value })}
                        placeholder="1920 x 1080"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Graphics (GPU)
                      </label>
                      <Input
                        type="text"
                        value={formData.gpu || ''}
                        onChange={(e) => setFormData({ ...formData, gpu: e.target.value })}
                        placeholder="e.g. Intel Iris Xe, RTX 4060"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Operating System
                      </label>
                      <select
                        value={formData.os}
                        onChange={(e) => setFormData({ ...formData, os: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="WINDOWS_11">Windows 11</option>
                        <option value="MACOS">macOS</option>
                        <option value="LINUX">Linux</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Battery Life
                      </label>
                      <Input
                        type="text"
                        value={formData.batteryLife || ''}
                        onChange={(e) => setFormData({ ...formData, batteryLife: e.target.value })}
                        placeholder="e.g. Up to 9 hours"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Natural Photos / Images */}
                <div>
                  <h3 className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                    4. Natural Laptop Photographs
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Use natural real-life photographs (e.g. /laptops/dell-vostro-natural.png or authentic desk photo URLs)
                  </p>

                  <div className="flex gap-2 mb-3">
                    <Input
                      type="text"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="Paste image URL (e.g. /laptops/dell-vostro-natural.png or https://...)"
                    />
                    <Button type="button" variant="outline" onClick={handleAddImage}>
                      Add Photo
                    </Button>
                  </div>

                  {/* Preset Natural Options */}
                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <span className="text-gray-500">Quick presets:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          images: ['/laptops/dell-vostro-natural.png', ...prev.images],
                        }))
                      }
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 text-gray-700 dark:text-gray-300"
                    >
                      + Dell Vostro Natural Photo
                    </button>
                  </div>

                  {/* Image Thumbnails */}
                  <div className="flex flex-wrap gap-3">
                    {formData.images.map((url, i) => (
                      <div key={i} className="relative group border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-white dark:bg-gray-800">
                        <img
                          src={url}
                          alt="Laptop view"
                          className="w-20 h-20 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/laptops/dell-vostro-natural.png';
                          }}
                        />
                        {i === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 bg-primary-600 text-white text-[9px] px-1 rounded font-bold">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Descriptions & Highlights */}
                <div>
                  <h3 className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-3">
                    5. Description & Badges
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Short Specs Summary
                      </label>
                      <Input
                        type="text"
                        value={formData.shortDescription || ''}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        placeholder="e.g. Core i5 11th Gen | 8GB RAM | 512GB SSD | 14'' FHD"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Detailed Description
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>

                    <div className="flex flex-wrap gap-6 pt-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured || false}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        Featured Laptop (Shows on Homepage)
                      </label>

                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={formData.isBestSeller || false}
                          onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                          className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        Best Seller Badge
                      </label>

                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={formData.isNewArrival || false}
                          onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                          className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        New Arrival Badge
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Footer */}
                <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={createMutation.isPending || updateMutation.isPending}
                  >
                    {selectedProduct ? 'Save Laptop Changes' : 'Publish Laptop'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
