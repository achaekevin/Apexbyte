import { useState, useRef } from 'react';
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
  FiUploadCloud,
  FiImage,
  FiLoader,
  FiCamera,
  FiPercent,
  FiCheckCircle,
  FiCheck,
  FiLayers,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import brandService, { Brand } from '../../services/brandService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { formatCurrency, parsePrice, getProductImage, DEFAULT_LAPTOP_IMAGE } from '../../utils/helpers';

export const VERIFIED_PRESET_IMAGES = [
  { label: 'Apple MacBook Pro', brand: 'Apple', url: '/laptops/macbook-pro-natural.jpg' },
  { label: 'Dell XPS 15', brand: 'Dell', url: '/laptops/dell-xps-natural.jpg' },
  { label: 'Dell Vostro 14', brand: 'Dell', url: '/laptops/dell-vostro-natural.png' },
  { label: 'HP Pavilion & ProBook', brand: 'HP', url: '/laptops/hp-pavilion-natural.jpg' },
  { label: 'Lenovo ThinkPad', brand: 'Lenovo', url: '/laptops/lenovo-thinkpad-natural.jpg' },
  { label: 'ASUS ROG Beast', brand: 'ASUS', url: '/laptops/asus-rog-natural.jpg' },
  { label: 'Samsung Galaxy Book', brand: 'Samsung', url: '/laptops/samsung-galaxybook-natural.jpg' },
  { label: 'Acer Predator & Swift', brand: 'Acer', url: '/laptops/acer-swift-natural.jpg' },
  { label: 'MSI Stealth Studio', brand: 'MSI', url: '/laptops/msi-stealth-natural.jpg' },
  { label: 'Razer Blade Stealth', brand: 'Razer', url: '/laptops/razer-blade-natural.jpg' },
  { label: 'Surface Studio', brand: 'Microsoft', url: '/laptops/surface-studio-natural.jpg' },
  { label: 'Showroom Fleet Master', brand: 'Showroom', url: '/laptops/showroom-fleet.jpg' },
];

interface LaptopFormData {
  name: string;
  brandId: string;
  categoryId: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  costPrice?: string;
  stock: string;
  status: 'PUBLISHED' | 'DRAFT' | 'OUT_OF_STOCK' | 'DISCONTINUED';
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
  status: 'PUBLISHED',
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
  images: ['/laptops/hp-pavilion-natural.jpg'],
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
};

const AdminProducts = () => {
  const queryClient = useQueryClient();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickPriceOpen, setIsQuickPriceOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quickPrice, setQuickPrice] = useState<string>('');
  const [quickComparePrice, setQuickComparePrice] = useState<string>('');
  const [quickStock, setQuickStock] = useState<string>('10');

  // Quick Photo Modal states
  const [photoProduct, setPhotoProduct] = useState<any | null>(null);
  const [photoList, setPhotoList] = useState<string[]>([]);
  const [photoInputUrl, setPhotoInputUrl] = useState('');
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhotoModal, setIsUploadingPhotoModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState<LaptopFormData>(INITIAL_FORM);
  const [imageInput, setImageInput] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState('');

  // Fetch products
  const {
    data: productsData,
    isLoading: loadingProducts,
    isError: errorProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['admin-products', currentPage, searchTerm, selectedBrand, selectedStatus],
    queryFn: () =>
      productService.getProducts({
        page: currentPage,
        limit: 15,
        search: searchTerm || undefined,
        brandId: selectedBrand || undefined,
        status: selectedStatus,
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

  const brandsList: Brand[] = Array.isArray(brands)
    ? brands
    : Array.isArray((brands as any)?.data)
    ? (brands as any).data
    : [];

  const categoriesList: any[] = Array.isArray(categories)
    ? categories
    : Array.isArray((categories as any)?.data)
    ? (categories as any).data
    : [];

  const productsList: any[] = Array.isArray(productsData?.data)
    ? productsData.data
    : Array.isArray(productsData)
    ? productsData
    : [];
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
      status: 'PUBLISHED',
      ram: '8',
      storage: '512',
      displaySize: '14.0',
      brandId: brandsList.length > 0 ? brandsList[0].id : '',
      categoryId: categoriesList.length > 0 ? categoriesList[0].id : '',
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
      price: product.price ? String(Math.round(parsePrice(product.price))) : '',
      compareAtPrice: product.compareAtPrice && parsePrice(product.compareAtPrice) > 0 ? String(Math.round(parsePrice(product.compareAtPrice))) : '',
      costPrice: product.costPrice ? String(Math.round(parsePrice(product.costPrice))) : '',
      stock: product.stock !== undefined && product.stock !== null ? String(product.stock) : '10',
      status: product.status || 'PUBLISHED',
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
        : [getProductImage(product)],
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
    const p = parsePrice(product.price);
    const c = parsePrice(product.compareAtPrice);
    setQuickPrice(p > 0 ? String(Math.round(p)) : '');
    setQuickComparePrice(c > 0 ? String(Math.round(c)) : '');
    setQuickStock(product.stock !== undefined && product.stock !== null ? String(product.stock) : '10');
    setIsQuickPriceOpen(true);
  };

  const openQuickPhotoModal = (product: any) => {
    setPhotoProduct(product);
    const currentImgs = Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((img: any) => (typeof img === 'string' ? img : img.url))
      : [getProductImage(product)];
    setPhotoList(currentImgs);
    setPhotoInputUrl('');
    setIsPhotoModalOpen(true);
  };

  const handleToggleStatus = (product: any) => {
    const nextStatus = product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    updateMutation.mutate({
      id: product.id,
      data: { status: nextStatus } as any,
    });
  };

  const applyQuickDiscountPercent = (percent: number) => {
    const compare = parsePrice(quickComparePrice) || parsePrice(quickPrice);
    if (!compare || compare <= 0) return;
    const discounted = Math.round(compare * (1 - percent / 100));
    setQuickPrice(String(discounted));
    if (!quickComparePrice) {
      setQuickComparePrice(String(compare));
    }
  };

  const applyFormDiscountPercent = (percent: number) => {
    const compare = parsePrice(formData.compareAtPrice) || parsePrice(formData.price);
    if (!compare || compare <= 0) return;
    const discounted = Math.round(compare * (1 - percent / 100));
    setFormData((prev) => ({
      ...prev,
      price: String(discounted),
      compareAtPrice: prev.compareAtPrice ? prev.compareAtPrice : String(compare),
    }));
  };

  const handleSaveQuickPhotos = () => {
    if (!photoProduct) return;
    if (photoList.length === 0) {
      alert('Please keep at least one laptop photo');
      return;
    }
    updateMutation.mutate({
      id: photoProduct.id,
      data: { images: photoList } as any,
    }, {
      onSuccess: () => {
        setIsPhotoModalOpen(false);
        setPhotoProduct(null);
      }
    });
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

  const handleSetMainImage = (index: number) => {
    setFormData((prev) => {
      const selected = prev.images[index];
      const rest = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: [selected, ...rest],
      };
    });
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsUploadingImage(true);
    setFormError('');

    try {
      const uploadData = new FormData();
      fileArray.forEach((file) => uploadData.append('images', file));

      const res = await productService.uploadImages(uploadData);
      const newUrls: string[] = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);

      if (newUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newUrls],
        }));
      } else {
        const localUrls = fileArray.map((file) => URL.createObjectURL(file));
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...localUrls],
        }));
      }
    } catch (err: any) {
      console.warn('Backend image upload error, using local previews:', err);
      const localUrls = fileArray.map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...localUrls],
      }));
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePhotoModalFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsUploadingPhotoModal(true);
    try {
      const uploadData = new FormData();
      fileArray.forEach((file) => uploadData.append('images', file));

      const res = await productService.uploadImages(uploadData);
      const newUrls: string[] = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);

      if (newUrls.length > 0) {
        setPhotoList((prev) => [...prev, ...newUrls]);
      } else {
        const localUrls = fileArray.map((file) => URL.createObjectURL(file));
        setPhotoList((prev) => [...prev, ...localUrls]);
      }
    } catch (err: any) {
      console.warn('Upload error, using local fallback:', err);
      const localUrls = fileArray.map((file) => URL.createObjectURL(file));
      setPhotoList((prev) => [...prev, ...localUrls]);
    } finally {
      setIsUploadingPhotoModal(false);
      if (photoFileInputRef.current) photoFileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Laptop name is required');
      return;
    }
    const priceNum = parsePrice(formData.price);
    if (!priceNum || priceNum <= 0) {
      setFormError('Valid price in KSh is required');
      return;
    }

    const payload = {
      ...formData,
      price: priceNum,
      compareAtPrice: formData.compareAtPrice ? parsePrice(formData.compareAtPrice) : null,
      stock: formData.stock ? Number(formData.stock) : 0,
      status: formData.status || 'PUBLISHED',
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
    const priceNum = parsePrice(quickPrice);
    if (!priceNum || priceNum <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    const compareNum = quickComparePrice ? parsePrice(quickComparePrice) : null;
    const stockNum = quickStock ? Number(quickStock) : undefined;

    updateMutation.mutate({
      id: selectedProduct.id,
      data: {
        price: priceNum,
        compareAtPrice: compareNum && compareNum > 0 ? compareNum : null,
        stock: stockNum !== undefined ? stockNum : undefined,
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiPackage className="text-primary-500" /> Laptop Inventory & Pricing Control
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add new laptops, edit prices in Kenyan Shillings (KSh), manage hardware specs, and upload product photos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Link to="/admin/brands">
            <Button variant="outline" size="sm">Manage Brands</Button>
          </Link>
          <Button onClick={openCreateModal} size="sm" leftIcon={<FiPlus />}>
            Add New Laptop
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by laptop name or SKU..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Laptop Brands</option>
            {brandsList.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
          >
            <option value="ALL">All Laptops (Live & Drafts)</option>
            <option value="PUBLISHED">🟢 Live in Store Only</option>
            <option value="DRAFT">🟡 Drafts / Hidden Only</option>
          </select>
        </div>

        <div className="flex items-center justify-end text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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
      ) : errorProducts ? (
        <ErrorMessage
          title="Unable to Load Laptops"
          error={productsError}
          onRetry={() => refetchProducts()}
          retryLabel="Retry Loading"
          className="my-6"
        />
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
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300 min-w-[660px]">
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
                          <div className="relative group/thumb flex-shrink-0">
                            <img
                              src={mainImage || DEFAULT_LAPTOP_IMAGE}
                              alt={product.name || 'Laptop'}
                              className="w-14 h-14 rounded-lg object-cover bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => openQuickPhotoModal(product)}
                              title="Change / Update Laptop Picture"
                              className="absolute inset-0 bg-black/70 opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center text-white text-[10px] font-semibold"
                            >
                              <FiCamera size={15} className="mb-0.5" />
                              Photo
                            </button>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-primary-600">
                              <Link to={product.id ? `/products/${product.id}` : '#'} target="_blank">
                                {product.name}
                              </Link>
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-400 font-mono">
                                SKU: {product.sku}
                              </span>
                              {/* 1-Click Status Switcher */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(product)}
                                title="Click to toggle store visibility"
                                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                                  product.status === 'PUBLISHED'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-100'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                {product.status === 'PUBLISHED' ? 'Live in Store' : 'Draft / Hidden'}
                              </button>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {product.isFeatured && (
                                <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 rounded font-semibold">
                                  Featured
                                </span>
                              )}
                              {product.isBestSeller && (
                                <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold">
                                  Best Seller
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Brand & Category */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {product.brand?.name || 'Generic'}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {product.category?.name || 'Laptops'}
                        </div>
                      </td>

                      {/* Specs */}
                      <td className="px-4 py-4 text-xs">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {product.processor || 'Core i5'}
                        </div>
                        <div className="text-gray-500 font-medium">
                          {product.ram}GB RAM • {product.storage}GB {product.storageType || 'SSD'}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {product.displaySize}" {product.displayResolution}
                        </div>
                      </td>

                      {/* Price in KSh & Discount & Quick Edit */}
                      <td className="px-4 py-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-gray-900 dark:text-white text-base">
                            {formatCurrency(product.price)}
                          </span>
                          {product.compareAtPrice && parsePrice(product.compareAtPrice) > parsePrice(product.price) && (
                            <span className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 px-1.5 py-0.5 rounded font-bold">
                              {Math.round(((parsePrice(product.compareAtPrice) - parsePrice(product.price)) / parsePrice(product.compareAtPrice)) * 100)}% OFF
                            </span>
                          )}
                        </div>
                        {product.compareAtPrice && parsePrice(product.compareAtPrice) > parsePrice(product.price) && (
                          <div className="text-xs text-gray-400 line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => openQuickPriceModal(product)}
                          className="text-xs text-primary-600 hover:text-primary-700 underline font-medium mt-1 flex items-center gap-1"
                        >
                          <FiDollarSign size={12} /> Edit Price & Discount
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Manage laptop photo & gallery"
                            onClick={() => openQuickPhotoModal(product)}
                            className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-lg transition-colors"
                          >
                            <FiCamera size={16} />
                          </button>
                          <button
                            type="button"
                            title="Edit price & discount"
                            onClick={() => openQuickPriceModal(product)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                          >
                            <FiDollarSign size={16} />
                          </button>
                          <Link to={`/products/${product.id}`} target="_blank">
                            <button
                              type="button"
                              title="View on storefront"
                              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <FiEye size={16} />
                            </button>
                          </Link>
                          <button
                            type="button"
                            title="Edit full laptop specifications & details"
                            onClick={() => openEditModal(product)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            type="button"
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

      {/* Quick Price & Discount Edit Modal */}
      <AnimatePresence>
        {isQuickPriceOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FiDollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Price, Discount & Stock Manager
                    </h3>
                    <p className="text-xs text-gray-500">Live Kenyan Shillings (KSh) & deals</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickPriceOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Product preview */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                <img
                  src={getProductImage(selectedProduct) || DEFAULT_LAPTOP_IMAGE}
                  alt={selectedProduct.name}
                  className="w-12 h-12 rounded-lg object-cover bg-white dark:bg-gray-800 border"
                />
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-xs text-gray-500 font-mono">SKU: {selectedProduct.sku || 'N/A'}</p>
                </div>
              </div>

              <form onSubmit={handleQuickPriceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Selling Price (KSh) *
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Regular / Was Price (KSh)
                    </label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={quickComparePrice}
                      onChange={(e) => setQuickComparePrice(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 62000"
                    />
                  </div>
                </div>

                {/* Quick Discount Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <FiPercent size={12} className="text-primary-500" /> Apply Quick Discount %:
                    </span>
                    <span className="text-[11px] text-gray-400">Calculates from regular price</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[5, 10, 15, 20, 25, 30].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => applyQuickDiscountPercent(pct)}
                        className="px-2 py-1.5 text-xs font-bold rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/60 text-primary-700 dark:text-primary-300 transition-colors"
                      >
                        {pct}% OFF
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Savings calculation badge */}
                {parsePrice(quickComparePrice) > parsePrice(quickPrice) && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <FiCheckCircle size={14} /> Customer Deal Active
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                        Buyer saves <span className="font-bold">{formatCurrency(parsePrice(quickComparePrice) - parsePrice(quickPrice))}</span> ({Math.round(((parsePrice(quickComparePrice) - parsePrice(quickPrice)) / parsePrice(quickComparePrice)) * 100)}% discount)
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-black bg-emerald-600 text-white rounded-lg shadow-xs">
                      {Math.round(((parsePrice(quickComparePrice) - parsePrice(quickPrice)) / parsePrice(quickComparePrice)) * 100)}% OFF
                    </span>
                  </div>
                )}

                {/* Stock Quantity */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Units in Stock
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={quickStock}
                    onChange={(e) => setQuickStock(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 15"
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
                    Save Price & Stock
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Photo Manager Modal */}
      <AnimatePresence>
        {isPhotoModalOpen && photoProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                    <FiCamera size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Laptop Photo & Gallery Manager
                    </h3>
                    <p className="text-xs text-gray-500">
                      Update images for <span className="font-semibold text-gray-800 dark:text-gray-200">{photoProduct.name}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Current Active Photos Gallery */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <FiLayers className="text-primary-500" /> Current Photos ({photoList.length})
                  </h4>
                  <span className="text-[11px] text-gray-400">First image is the main storefront picture</span>
                </div>

                {photoList.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs">
                    No photos currently attached. Pick a verified preset below or upload a file.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {photoList.map((url, i) => (
                      <div
                        key={i}
                        className={`relative group rounded-xl overflow-hidden border p-1 bg-white dark:bg-gray-800 transition-all shadow-xs ${
                          i === 0
                            ? 'border-primary-500 ring-2 ring-primary-500/40'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Laptop photo ${i + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                          }}
                        />

                        {i === 0 ? (
                          <span className="absolute top-2 left-2 bg-primary-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow flex items-center gap-1">
                            <FiCheck size={10} /> Main Photo
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...photoList];
                              const [chosen] = updated.splice(i, 1);
                              updated.unshift(chosen);
                              setPhotoList(updated);
                            }}
                            className="absolute bottom-2 left-2 bg-gray-900/90 hover:bg-black text-white text-[10px] px-2 py-1 rounded transition-opacity shadow font-semibold"
                            title="Set as main storefront photo"
                          >
                            Set Main
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setPhotoList(photoList.filter((_, idx) => idx !== i));
                          }}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow transition-transform hover:scale-110"
                          title="Remove photo"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 1-Click Verified Laptop Preset Photos */}
              <div className="mb-5 p-3.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <FiImage className="text-primary-500" /> 1-Click Verified Laptop Photos
                  </h4>
                  <span className="text-[11px] text-gray-400">Select authentic photo to apply immediately</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {VERIFIED_PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        if (photoList.includes(preset.url)) {
                          setPhotoList([preset.url, ...photoList.filter((u) => u !== preset.url)]);
                        } else {
                          setPhotoList([preset.url, ...photoList]);
                        }
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-500 bg-white dark:bg-gray-800 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 text-left transition-all group"
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-10 h-10 rounded-md object-cover flex-shrink-0 border"
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600">
                          {preset.brand}
                        </p>
                        <p className="text-[10px] text-gray-500 line-clamp-1">{preset.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload New Image from Device */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Or Upload Local Image / Enter URL
                </h4>

                <input
                  type="file"
                  ref={photoFileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handlePhotoModalFileUpload(e.target.files);
                    }
                  }}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  multiple
                  className="hidden"
                />

                <div
                  onClick={() => photoFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-white dark:bg-gray-800"
                >
                  {isUploadingPhotoModal ? (
                    <div className="flex items-center justify-center gap-2 text-primary-600 text-xs py-2 font-medium">
                      <FiLoader className="animate-spin" size={18} /> Uploading photo...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-300 py-1">
                      <FiUploadCloud size={18} className="text-primary-500" />
                      <span className="font-semibold text-primary-600 dark:text-primary-400">Click to upload photo from your computer</span>
                      <span className="text-gray-400">(PNG, JPG, WEBP)</span>
                    </div>
                  )}
                </div>

                {/* Direct Image URL input */}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={photoInputUrl}
                    onChange={(e) => setPhotoInputUrl(e.target.value)}
                    placeholder="Or paste an image web URL (e.g. /laptops/dell-vostro-natural.png)"
                    className="text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (photoInputUrl.trim()) {
                          setPhotoList([photoInputUrl.trim(), ...photoList]);
                          setPhotoInputUrl('');
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (photoInputUrl.trim()) {
                        setPhotoList([photoInputUrl.trim(), ...photoList]);
                        setPhotoInputUrl('');
                      }
                    }}
                    className="whitespace-nowrap text-xs"
                  >
                    <FiPlus size={14} className="mr-1" /> Add URL
                  </Button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPhotoModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveQuickPhotos}
                  isLoading={updateMutation.isPending}
                  leftIcon={<FiCheck />}
                >
                  Save Photo Changes
                </Button>
              </div>
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
                    Configure pricing in KES, technical specifications, inventory, and product photos
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
                        {brandsList.map((b) => (
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
                        {categoriesList.map((c: any) => (
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

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Storefront Visibility / Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="PUBLISHED">🟢 Live on Storefront (PUBLISHED)</option>
                        <option value="DRAFT">🟡 Draft / Hidden from Store (DRAFT)</option>
                        <option value="OUT_OF_STOCK">🔴 Out of Stock</option>
                        <option value="DISCONTINUED">⚪ Discontinued</option>
                      </select>
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
                        Original / Compare At Price (KSh)
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

                  {/* Quick Discount Presets in Full Edit Form */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <FiPercent size={12} className="text-primary-500" /> Apply Quick Discount %:
                      </span>
                      <span className="text-[11px] text-gray-400">Recalculates selling price from regular price</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5">
                      {[5, 10, 15, 20, 25, 30].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => applyFormDiscountPercent(pct)}
                          className="px-2 py-1 text-xs font-bold rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/60 text-primary-700 dark:text-primary-300 transition-colors"
                        >
                          {pct}% OFF
                        </button>
                      ))}
                    </div>
                    {parsePrice(formData.compareAtPrice) > parsePrice(formData.price) && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between font-medium">
                        <span>
                          Customer savings: <strong>{formatCurrency(parsePrice(formData.compareAtPrice) - parsePrice(formData.price))}</strong>
                        </span>
                        <span className="font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                          {Math.round(((parsePrice(formData.compareAtPrice) - parsePrice(formData.price)) / parsePrice(formData.compareAtPrice)) * 100)}% Discount Active
                        </span>
                      </div>
                    )}
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

                {/* 4. Product Images & Gallery */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                      4. Product Images ({formData.images.length})
                    </h3>
                    <span className="text-xs text-gray-500">
                      The primary photo is displayed as the main storefront thumbnail
                    </span>
                  </div>

                  {/* 1-Click Verified Laptop Preset Photos Drawer */}
                  <div className="mb-3.5 p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <FiImage className="text-primary-500" /> Quick Verified Laptop Photos:
                      </p>
                      <span className="text-[11px] text-gray-400">Click to attach authentic photography</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {VERIFIED_PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => {
                            if (!formData.images.includes(preset.url)) {
                              setFormData((prev) => ({
                                ...prev,
                                images: [preset.url, ...prev.images],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                images: [preset.url, ...prev.images.filter((u) => u !== preset.url)],
                              }));
                            }
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                            formData.images.includes(preset.url)
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-semibold'
                              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary-400'
                          }`}
                        >
                          <img src={preset.url} alt="" className="w-4 h-4 rounded object-cover" />
                          <span>{preset.label}</span>
                          {formData.images.includes(preset.url) && <FiCheck size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hidden Native File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(e.target.files);
                      }
                    }}
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    multiple
                    className="hidden"
                  />

                  {/* Clickable Drag & Drop Upload Module */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleFileUpload(e.dataTransfer.files);
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 scale-[1.01]'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center justify-center py-4 text-primary-600">
                        <FiLoader className="animate-spin mb-2 text-primary-500" size={32} />
                        <p className="text-sm font-semibold">Uploading photos to catalog...</p>
                        <p className="text-xs text-gray-500 mt-1">Please wait while images are processed</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3 shadow-inner">
                          <FiUploadCloud size={26} />
                        </div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          Click to browse photos or drag and drop files here
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, JPEG, WEBP up to 10MB (select one or multiple images)
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="mt-3.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow transition-colors flex items-center gap-1.5"
                        >
                          <FiImage size={14} /> Browse Device Photos
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Direct Image URL Alternative */}
                  <div className="mt-3 flex gap-2">
                    <Input
                      type="text"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="Or paste an image web URL (e.g. https://... or /laptops/...)"
                      className="text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddImage}
                      className="whitespace-nowrap text-xs"
                    >
                      <FiPlus size={14} className="mr-1" /> Add URL
                    </Button>
                  </div>

                  {/* Uploaded Photos Gallery Preview */}
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Product Gallery Preview ({formData.images.length} {formData.images.length === 1 ? 'photo' : 'photos'}):
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {formData.images.map((url, i) => (
                          <div
                            key={i}
                            className={`relative group rounded-xl overflow-hidden border p-1 bg-white dark:bg-gray-800 transition-all shadow-sm ${
                              i === 0
                                ? 'border-primary-500 ring-2 ring-primary-500/30'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Product photo ${i + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = '/laptops/dell-vostro-natural.png';
                              }}
                            />

                            {/* Main badge or Set Main button */}
                            {i === 0 ? (
                              <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold shadow">
                                Main Photo
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(i)}
                                className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 bg-gray-900/90 hover:bg-black text-white text-xs px-2.5 py-1 rounded transition-opacity shadow font-semibold"
                                title="Set as main storefront photo"
                              >
                                Set Main
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(i)}
                              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow transition-transform hover:scale-110"
                              title="Remove photo"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
