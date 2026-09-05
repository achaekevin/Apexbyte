import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMapPin, FiPhone, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import addressService, { Address, AddressFormData } from '../../services/addressService';

const initialFormData: AddressFormData = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: 'Kisii',
  state: 'Kisii County',
  country: 'Kenya',
  postalCode: '40200',
  isDefault: false,
  type: 'HOME',
};

const Addresses = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
  });

  const createMutation = useMutation({
    mutationFn: addressService.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address saved successfully');
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save address');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddressFormData> }) =>
      addressService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address updated successfully');
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update address');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: addressService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete address');
    },
  });

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: addressLine1Clean(address.addressLine1),
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
      type: address.type || 'HOME',
    });
    setIsModalOpen(true);
  };

  const addressLine1Clean = (line: string) => line || '';

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.addressLine1 || !formData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleSetDefault = (address: Address) => {
    updateMutation.mutate({ id: address.id, data: { isDefault: true } });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this delivery address?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Delivery Addresses - Apexbyte</title>
      </Helmet>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Delivery Addresses</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Manage shipping and showroom pickup contact locations for fast parcel dispatch.
            </p>
          </div>
          <Button onClick={openAddModal} className="flex items-center gap-2">
            <FiPlus /> Add New Address
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <LoadingSkeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : !addresses || addresses.length === 0 ? (
          <Card className="text-center py-12">
            <FiMapPin className="text-5xl text-gray-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">No Saved Addresses</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
              Save your residence, office, or courier collection point in Kisii, Nairobi, or countrywide.
            </p>
            <Button onClick={openAddModal} className="inline-flex items-center gap-2">
              <FiPlus /> Add Your First Address
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((addr) => (
              <Card
                key={addr.id}
                className={`p-6 relative border-2 transition-all ${
                  addr.isDefault
                    ? 'border-primary-500/80 shadow-md bg-primary-50/10 dark:bg-primary-950/10'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {addr.fullName}
                    </span>
                    {addr.isDefault && (
                      <Badge variant="primary" size="sm">
                        Default Address
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                    {addr.type || 'HOME'}
                  </span>
                </div>

                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-6">
                  <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FiPhone className="shrink-0 text-emerald-500" /> {addr.phone}
                  </p>
                  <p className="flex items-start gap-2">
                    <FiMapPin className="shrink-0 text-amber-500 mt-1" />
                    <span>
                      {addr.addressLine1}
                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                      <br />
                      {addr.city}, {addr.state} {addr.postalCode}
                      <br />
                      {addr.country}
                    </span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 text-xs sm:text-sm">
                  <div>
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr)}
                        className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(addr)}
                      className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 font-medium transition-colors"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition-colors"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Address Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingAddress ? 'Edit Address' : 'Add New Delivery Address'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Recipient Full Name *
                      </label>
                      <Input
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number (for Courier/SMS) *
                      </label>
                      <Input
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 0712 345 678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Street Address / Building / Floor *
                    </label>
                    <Input
                      required
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      placeholder="e.g. Mocha Place, 2nd Floor, Rm S14"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Landmark / Suite (Optional)
                    </label>
                    <Input
                      value={formData.addressLine2 || ''}
                      onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                      placeholder="Near Kisii Level 5 Hospital Gate"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Town / City *
                      </label>
                      <Input
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Kisii"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        County / State *
                      </label>
                      <Input
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Kisii County"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Postal Code
                      </label>
                      <Input
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="40200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Address Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium"
                      >
                        <option value="HOME">Home</option>
                        <option value="WORK">Office / Business</option>
                        <option value="OTHER">Courier Collection Hub</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Set as primary default address for 1-click checkout
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <Button type="button" variant="outline" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingAddress ? 'Update Address' : 'Save Address'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Addresses;
