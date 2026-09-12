import React, { useState } from 'react';
import { usePantry } from '../../context/PantryContext';
import { uploadImage } from '../../services/firebase/storage';
import { 
  IoGridOutline, IoListOutline, IoSearchOutline, 
  IoFilterOutline, IoTrashOutline, IoCreateOutline,
  IoScanOutline, IoFunnelOutline, IoCalendarOutline 
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

const ITEMS_PER_PAGE = 8;

const Pantry = () => {
  const { 
    pantryItems, 
    categories, 
    addPantryItem, 
    updatePantryItem, 
    deletePantryItem 
  } = usePantry();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('expiryDate'); // expiryDate, quantity, name, purchaseDate
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  
  // UI Display States
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [currentPage, setCurrentPage] = useState(1);

  // CRUD Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add, edit
  const [editingItemId, setEditingItemId] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [storageLocation, setStorageLocation] = useState('Fridge');
  const [notes, setNotes] = useState('');
  const [barcode, setBarcode] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Barcode Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Expiry calculation helpers
  const getDaysRemaining = (expiryDateStr) => {
    if (!expiryDateStr) return 999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const getExpiryBadge = (daysLeft) => {
    if (daysLeft < 0) return <Badge variant="danger">Expired</Badge>;
    if (daysLeft === 0) return <Badge variant="danger">Expires Today</Badge>;
    if (daysLeft === 1) return <Badge variant="danger">Expires Tomorrow</Badge>;
    if (daysLeft <= 3) return <Badge variant="warning">{daysLeft} Days Left</Badge>;
    if (daysLeft <= 7) return <Badge variant="neutral">{daysLeft} Days Left</Badge>;
    return <Badge variant="success">{daysLeft} Days Left</Badge>;
  };

  // 1. Process List (Filter, Search, Sort)
  const filteredItems = pantryItems
    .filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchLocation = selectedLocation === 'All' || item.storageLocation === selectedLocation;
      return matchSearch && matchCategory && matchLocation;
    })
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Handle null/empty expiry dates
      if (sortBy === 'expiryDate') {
        if (!valA) return sortOrder === 'asc' ? 1 : -1;
        if (!valB) return sortOrder === 'asc' ? -1 : 1;
      }

      if (sortBy === 'quantity') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // 2. Pagination Logic
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // 3. Open Modals
  const openAddModal = () => {
    setModalMode('add');
    setName('');
    setCategory('Vegetables');
    setQuantity('');
    setUnit('pcs');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setExpiryDate('');
    setStorageLocation('Fridge');
    setNotes('');
    setBarcode('');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setEditingItemId(item.id);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity);
    setUnit(item.unit || 'pcs');
    setPurchaseDate(item.purchaseDate || new Date().toISOString().split('T')[0]);
    setExpiryDate(item.expiryDate || '');
    setStorageLocation(item.storageLocation || 'Fridge');
    setNotes(item.notes || '');
    setBarcode(item.barcode || '');
    setImageFile(null);
    setIsModalOpen(true);
  };

  // 4. Form Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !quantity) return;

    setIsSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'ingredients');
      }

      const itemData = {
        name,
        category,
        quantity: parseFloat(quantity),
        unit,
        purchaseDate,
        expiryDate,
        storageLocation,
        notes,
        barcode,
        ...(imageUrl && { image: imageUrl })
      };

      if (modalMode === 'add') {
        await addPantryItem(itemData);
      } else {
        await updatePantryItem(editingItemId, itemData);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save pantry item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Delete Item
  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this ingredient?')) {
      await deletePantryItem(itemId);
    }
  };

  // 6. Barcode Simulator Scanner Action
  const handleBarcodeScan = (mockCode, mockProduct) => {
    setBarcode(mockCode);
    setName(mockProduct.name);
    setCategory(mockProduct.category);
    setStorageLocation(mockProduct.location);
    setUnit(mockProduct.unit);
    setQuantity(mockProduct.qty);
    setIsScannerOpen(false);
    setIsModalOpen(true); // Open edit/add modal prefilled
  };

  return (
    <div className="flex flex-col gap-5 select-none">
      
      {/* Top Filter Bar */}
      <Card className="border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search ingredients..."
            className="w-full h-10 pl-10 pr-4 bg-background/50 border border-border/80 rounded-full text-sm text-text-main focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5"
          />
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/60 text-lg" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-background/50 border border-border/80 rounded-full px-3 py-1.5 text-xs text-text-muted">
            <IoFilterOutline />
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-0 outline-none text-text-main font-semibold cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {/* Location Filter */}
          <div className="flex items-center gap-1 bg-background/50 border border-border/80 rounded-full px-3 py-1.5 text-xs text-text-muted">
            <IoFunnelOutline />
            <select
              value={selectedLocation}
              onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-0 outline-none text-text-main font-semibold cursor-pointer"
            >
              <option value="All">All Locations</option>
              <option value="Fridge">Fridge</option>
              <option value="Freezer">Freezer</option>
              <option value="Pantry">Pantry</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-1 bg-background/50 border border-border/80 rounded-full px-3 py-1.5 text-xs text-text-muted">
            <IoCalendarOutline />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); }}
              className="bg-transparent border-0 outline-none text-text-main font-semibold cursor-pointer"
            >
              <option value="expiryDate">Sort by Expiry</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="name">Sort by Name</option>
              <option value="purchaseDate">Sort by Purchase</option>
            </select>
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="ml-1 font-bold text-primary hover:opacity-85 text-[10px]"
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>

          {/* Display Mode Toggles */}
          <div className="flex border border-border rounded-full p-0.5 bg-background/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-muted'}`}
            >
              <IoGridOutline />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-muted'}`}
            >
              <IoListOutline />
            </button>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={openAddModal} variant="primary" size="md">
          + Add Item
        </Button>
        <Button onClick={() => setIsScannerOpen(true)} variant="secondary" size="md" icon={IoScanOutline}>
          Scan Barcode
        </Button>
      </div>

      {/* Pantry Listings */}
      {currentItems.length === 0 ? (
        <Card className="py-16 text-center border border-border/85 flex flex-col items-center gap-3">
          <span className="text-4xl">🍎</span>
          <span className="font-display font-bold text-text-main text-base">No Ingredients Found</span>
          <p className="text-xs text-text-muted max-w-xs">
            Try adjusting your search criteria, or click "+ Add Item" to register your first kitchen ingredient.
          </p>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentItems.map((item) => {
            const daysLeft = getDaysRemaining(item.expiryDate);
            return (
              <Card key={item.id} hoverable className="flex flex-col justify-between border border-border/70 h-full p-4 relative bg-card">
                <div>
                  <div className="w-full h-32 bg-background border border-border rounded-custom overflow-hidden mb-3 relative flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-text-muted/40 font-display">
                        {categories.find(c => c.name === item.category)?.icon || '🍲'}
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 text-[10px] bg-card/90 backdrop-blur-xs font-semibold px-2 py-0.5 rounded-full text-text-muted">
                      {item.storageLocation}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                      {item.category}
                    </span>
                    <h4 className="font-display font-bold text-sm text-text-main leading-tight truncate">
                      {item.name}
                    </h4>
                    <span className="text-xs font-medium text-text-muted">
                      Qty: {item.quantity} {item.unit}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4 border-t border-border/50 pt-3">
                  <div className="flex justify-between items-center text-xs">
                    {getExpiryBadge(daysLeft)}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-full hover:bg-primary/10 text-primary transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <IoCreateOutline className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-full hover:bg-danger/10 text-danger transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <IoTrashOutline className="text-lg" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List Layout */
        <Card className="border border-border/80 overflow-hidden" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background border-b border-border/60 text-xs font-bold text-text-muted select-none">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {currentItems.map((item) => {
                  const daysLeft = getDaysRemaining(item.expiryDate);
                  return (
                    <tr key={item.id} className="hover:bg-background/25 transition-colors">
                      <td className="p-4 font-bold text-text-main flex items-center gap-3">
                        <span className="text-lg bg-background p-1.5 rounded-full">
                          {categories.find(c => c.name === item.category)?.icon || '🍲'}
                        </span>
                        <span>{item.name}</span>
                      </td>
                      <td className="p-4 text-xs font-semibold text-text-muted">{item.category}</td>
                      <td className="p-4 text-xs font-semibold text-text-muted">{item.quantity} {item.unit}</td>
                      <td className="p-4 text-xs font-medium text-text-muted">
                        <Badge variant="neutral" size="sm">{item.storageLocation}</Badge>
                      </td>
                      <td className="p-4">{getExpiryBadge(daysLeft)}</td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-full hover:bg-primary/10 text-primary transition-colors cursor-pointer"
                          >
                            <IoCreateOutline className="text-base" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-full hover:bg-danger/10 text-danger transition-colors cursor-pointer"
                          >
                            <IoTrashOutline className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4 select-none">
          <span className="text-xs text-text-muted">
            Page <b>{currentPage}</b> of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ----------------- CRUD INGREDIENT MODAL ----------------- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add Kitchen Ingredient' : 'Edit Ingredient Details'}
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Ingredient Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Baby Spinach"
                required
              />
            </div>
            
            <Input
              label="Quantity"
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="E.g., 200"
              required
            />

            <div className="w-full flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-text-muted">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-11 px-4 bg-card border border-border rounded-custom text-sm text-text-main focus:outline-none focus:border-primary"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="g">Grams (g)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="l">Liters (l)</option>
              </select>
            </div>

            <div className="w-full flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-text-muted">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-4 bg-card border border-border rounded-custom text-sm text-text-main focus:outline-none focus:border-primary"
              >
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="w-full flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-text-muted">Storage Location</label>
              <select
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full h-11 px-4 bg-card border border-border rounded-custom text-sm text-text-main focus:outline-none focus:border-primary"
              >
                <option value="Fridge">Fridge</option>
                <option value="Freezer">Freezer</option>
                <option value="Pantry">Pantry</option>
              </select>
            </div>

            <Input
              label="Purchase Date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />

            <Input
              label="Expiry Date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              helperText="Leave empty if item does not expire."
            />

            <div className="col-span-2">
              <Input
                label="Barcode (Optional)"
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan or type barcode key"
              />
            </div>

            <div className="col-span-2">
              <Input
                label="Storage Notes"
                type="textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Airtight jar, wash before prep, etc."
                rows={2}
              />
            </div>

            <div className="col-span-2 mb-4">
              <label className="text-xs font-semibold text-text-muted mb-1.5 block">Photo Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-2.5 mt-4 border-t border-border/60 pt-4 justify-end">
            <Button onClick={() => setIsModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} variant="primary" size="md">
              {modalMode === 'add' ? 'Add Ingredient' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ----------------- BARCODE SCANNER MODAL ----------------- */}
      <Modal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        title="Barcode Scanner Simulator"
      >
        <div className="flex flex-col gap-4 text-center py-4">
          <div className="w-full h-44 bg-neutral-900 rounded-custom border border-border relative flex items-center justify-center overflow-hidden">
            {/* Pulsing red laser line simulating scanner */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-600 animate-pulse-soft" />
            <IoScanOutline className="text-white/20 text-6xl animate-pulse" />
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Select one of the mock barcodes below to simulate scanning a grocery item with your device's camera:
          </p>

          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { code: '8801123', label: 'Fresh Whole Milk', mock: { name: 'Whole Milk', category: 'Dairy', location: 'Fridge', unit: 'ml', qty: 1000 } },
              { code: '8802245', label: 'Organic Bananas', mock: { name: 'Organic Bananas', category: 'Fruits', location: 'Pantry', unit: 'pcs', qty: 6 } },
              { code: '8803367', label: 'Greek Yogurt 500g', mock: { name: 'Greek Yogurt', category: 'Dairy', location: 'Fridge', unit: 'g', qty: 500 } },
              { code: '8804489', label: 'Spaghetti Pasta', mock: { name: 'Spaghetti', category: 'Grains & Pasta', location: 'Pantry', unit: 'g', qty: 500 } }
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => handleBarcodeScan(item.code, item.mock)}
                className="p-3 text-left border border-border hover:border-primary hover:bg-primary/5 rounded-custom transition-all text-xs font-semibold cursor-pointer"
              >
                <div className="text-text-main">{item.label}</div>
                <div className="text-[10px] text-text-muted font-mono mt-0.5">Code: {item.code}</div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Pantry;
