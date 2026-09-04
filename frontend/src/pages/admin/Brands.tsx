import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiGlobe, FiTag, FiX } from 'react-icons/fi';
import brandService, { Brand, CreateBrandData } from '../../services/brandService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const AdminBrands = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateBrandData>({
    name: '',
    description: '',
    website: '',
    logo: '',
    isActive: true,
  });
  const [formError, setFormError] = useState('');

  // Fetch all brands
  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ['admin-brands'],
    queryFn: () => brandService.getBrands(),
  });

  // Create brand mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateBrandData) => brandService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create brand');
    },
  });

  // Update brand mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBrandData> }) =>
      brandService.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to update brand');
    },
  });

  // Delete brand mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => brandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Cannot delete brand with associated products');
    },
  });

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      description: '',
      website: '',
      logo: '',
      isActive: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      website: brand.website || '',
      logo: brand.logo || '',
      isActive: brand.isActive !== false,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Brand name is required');
      return;
    }

    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (brand: Brand) => {
    if (confirm(`Are you sure you want to delete brand "${brand.name}"?`)) {
      deleteMutation.mutate(brand.id);
    }
  };

  // Filter brands by search
  const filteredBrands = brands?.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiTag className="text-primary-500" /> Laptop Brands Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add new laptop brands, upload brand logos, and manage manufacturers across the store
          </p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<FiPlus />}>
          Add New Brand
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brands by name or description..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {filteredBrands.length} brands total
        </span>
      </div>

      {/* Brands Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <LoadingSkeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filteredBrands.length === 0 ? (
        <Card className="text-center py-12">
          <FiTag className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No brands found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'No brands match your search query.' : 'No laptop brands exist yet. Add the first one!'}
          </p>
          <Button onClick={openCreateModal} leftIcon={<FiPlus />}>
            Add New Brand
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-12 h-12 rounded-lg object-contain bg-gray-50 dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-lg">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{brand.name}</h3>
                      <span className="text-xs text-gray-500 font-mono">slug: {brand.slug}</span>
                    </div>
                  </div>
                  <Badge variant={brand.isActive !== false ? 'success' : 'info'}>
                    {brand.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                  {brand.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {brand._count?.products !== undefined && (
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      📦 {brand._count.products} laptops
                    </span>
                  )}
                  {brand.website && (
                    <a
                      href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary-600 hover:underline"
                    >
                      <FiGlobe size={12} /> Website
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<FiEdit2 size={14} />}
                  onClick={() => openEditModal(brand)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<FiTrash2 size={14} />}
                  onClick={() => handleDelete(brand)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Upload New Laptop Brand'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FiX size={20} />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Brand Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alienware, Framework, Huawei, Sony"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Brand Logo URL
                  </label>
                  <Input
                    type="text"
                    value={formData.logo || ''}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://... or /laptops/... (URL to logo image)"
                  />
                  {formData.logo && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500">Preview:</span>
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        className="w-10 h-10 object-contain rounded bg-white p-1 border"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description of this laptop brand (e.g. High-performance gaming, premium modular ultrabooks)"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Website URL (Optional)
                  </label>
                  <Input
                    type="text"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.brand.com"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="brandActive"
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <label htmlFor="brandActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active brand (visible to customers in store filter)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingBrand ? 'Save Changes' : 'Create Brand'}
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

export default AdminBrands;
