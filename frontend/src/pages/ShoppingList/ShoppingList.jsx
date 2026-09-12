import React, { useState } from 'react';
import { usePantry } from '../../context/PantryContext';
import { 
  IoCheckboxOutline, IoSquareOutline, IoTrashOutline, 
  IoAddOutline, IoDownloadOutline, IoPrintOutline,
  IoArrowForwardCircleOutline, IoCreateOutline 
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { motion } from 'framer-motion';
import Modal from '../../components/ui/Modal';

const ShoppingList = () => {
  const { 
    shoppingList, 
    categories, 
    addShoppingItem, 
    updateShoppingItem, 
    deleteShoppingItem,
    transferToPantry,
    clearShoppingList 
  } = usePantry();

  // CRUD Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add, edit
  const [editingItemId, setEditingItemId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expiry date modal state for pantry transfer
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferExpiryDate, setTransferExpiryDate] = useState('');
  const [transferLocation, setTransferLocation] = useState('Fridge');

  // Toggle Checked State
  const handleToggleComplete = async (item) => {
    await updateShoppingItem(item.id, { completed: !item.completed });
  };

  // 1. Group Items by Category
  const groupedItems = shoppingList.reduce((acc, item) => {
    const cat = item.category || 'Grains & Pasta';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const checkedItems = shoppingList.filter(item => item.completed);

  // 2. Open Add/Edit
  const openAddModal = () => {
    setModalMode('add');
    setName('');
    setCategory('Vegetables');
    setQuantity('1');
    setUnit('pcs');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setEditingItemId(item.id);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity);
    setUnit(item.unit || 'pcs');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  // 3. Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !quantity) return;

    setIsSubmitting(true);
    try {
      const itemData = {
        name,
        category,
        quantity: parseFloat(quantity),
        unit,
        notes
      };

      if (modalMode === 'add') {
        await addShoppingItem(itemData);
      } else {
        await updateShoppingItem(editingItemId, itemData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Delete Item
  const handleDeleteItem = async (itemId) => {
    await deleteShoppingItem(itemId);
  };

  // 5. Transfer Purchased Items to Pantry
  const handleTransferCheckedItems = async (e) => {
    e.preventDefault();
    if (checkedItems.length === 0) return;

    try {
      for (const item of checkedItems) {
        await transferToPantry(item, {
          expiryDate: transferExpiryDate,
          storageLocation: transferLocation
        });
      }
      setIsTransferModalOpen(false);
      alert(`Moved ${checkedItems.length} items to your Pantry stock!`);
    } catch (err) {
      console.error(err);
      alert('Failed to transfer items.');
    }
  };

  // 6. CSV Exporter Utility
  const handleCSVExport = () => {
    if (shoppingList.length === 0) return;
    
    const headers = ['Ingredient Name', 'Category', 'Quantity', 'Unit', 'Completed', 'Notes'];
    const rows = shoppingList.map(item => [
      item.name,
      item.category,
      item.quantity,
      item.unit,
      item.completed ? 'Completed' : 'Pending',
      item.notes || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "savebite_shopping_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 7. Print Layout
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-5 select-none print-area">
      
      {/* Action header bar */}
      <Card className="border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 no-print">
        <div className="flex items-center gap-2">
          <Button onClick={openAddModal} variant="primary" size="sm" icon={IoAddOutline}>
            Add Item
          </Button>
          {checkedItems.length > 0 && (
            <Button 
              onClick={() => {
                setTransferExpiryDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
                setIsTransferModalOpen(true);
              }} 
              variant="secondary" 
              size="sm" 
              icon={IoArrowForwardCircleOutline}
            >
              Move Checked to Pantry ({checkedItems.length})
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCSVExport} variant="outline" size="sm" icon={IoDownloadOutline} disabled={shoppingList.length === 0}>
            Export CSV
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm" icon={IoPrintOutline} disabled={shoppingList.length === 0}>
            Print List
          </Button>
        </div>
      </Card>

      {/* Main checklist grid */}
      {shoppingList.length === 0 ? (
        <Card className="py-20 text-center border border-border/85 flex flex-col items-center gap-3">
          <span className="text-4xl">🛒</span>
          <span className="font-display font-bold text-text-main text-base">Your List is Empty</span>
          <p className="text-xs text-text-muted max-w-xs">
            Add ingredients manually, or click "Export Missing" when viewing recipes to auto-populate.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.keys(groupedItems).map((catName) => {
            const catIcon = categories.find(c => c.name === catName)?.icon || '🛒';
            return (
              <div key={catName} className="flex flex-col gap-3">
                {/* Category Header */}
                <h3 className="font-display font-bold text-sm text-text-main flex items-center gap-2 border-b border-border/60 pb-2">
                  <span>{catIcon}</span>
                  <span>{catName}</span>
                  <span className="text-[10px] font-bold bg-border/40 text-text-muted px-2 py-0.5 rounded-full">
                    {groupedItems[catName].length}
                  </span>
                </h3>

                {/* Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedItems[catName].map((item) => (
                    <Card 
                      key={item.id} 
                      className={`border p-4 transition-all duration-200 ${item.completed ? 'border-border bg-background/20 opacity-70' : 'border-border/70 bg-card'}`}
                      noPadding
                    >
                      <div className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Checked Icon */}
                          <motion.button
                            onClick={() => handleToggleComplete(item)}
                            whileTap={{ scale: 0.8 }}
                            className="text-text-muted hover:text-primary transition-colors text-xl cursor-pointer no-print"
                          >
                            {item.completed ? (
                              <IoCheckboxOutline className="text-primary" />
                            ) : (
                              <IoSquareOutline />
                            )}
                          </motion.button>

                          <div className="flex flex-col min-w-0">
                            <span className={`text-xs font-bold leading-tight ${item.completed ? 'text-text-muted animate-draw-line' : 'text-text-main'}`}>
                              {item.name}
                            </span>
                            {item.notes && (
                              <span className="text-[10px] text-text-muted truncate mt-0.5">
                                {item.notes}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-semibold text-text-muted">
                            {item.quantity} {item.unit}
                          </span>
                          
                          {/* Actions */}
                          <div className="flex gap-2 no-print">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-full hover:bg-primary/10 text-primary transition-colors cursor-pointer"
                            >
                              <IoCreateOutline className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 rounded-full hover:bg-danger/10 text-danger transition-colors cursor-pointer"
                            >
                              <IoTrashOutline className="text-sm" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- ADD/EDIT ITEM MODAL ----------------- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add Item to Shopping List' : 'Edit Shopping Item'}
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col">
          <Input
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g., Skim Milk"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
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

            <div className="col-span-2 w-full flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-text-muted">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-4 bg-card border border-border rounded-custom text-sm text-text-main focus:outline-none"
              >
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <Input
                label="Notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., buy organic if available"
              />
            </div>
          </div>

          <div className="flex gap-2.5 mt-4 border-t border-border/60 pt-4 justify-end">
            <Button onClick={() => setIsModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} variant="primary" size="md">
              {modalMode === 'add' ? 'Add Item' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ----------------- TRANSFER TO PANTRY OPTIONS MODAL ----------------- */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Purchased Items to Inventory"
      >
        <form onSubmit={handleTransferCheckedItems} className="flex flex-col gap-4">
          <p className="text-xs text-text-muted leading-relaxed">
            You are moving <b>{checkedItems.length}</b> purchased items to your active kitchen stock. Specify a default expiry date and storage location:
          </p>

          <Input
            label="Estimated Expiry Date"
            type="date"
            value={transferExpiryDate}
            onChange={(e) => setTransferExpiryDate(e.target.value)}
            required
          />

          <div className="w-full flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-semibold text-text-muted">Storage Location</label>
            <select
              value={transferLocation}
              onChange={(e) => setTransferLocation(e.target.value)}
              className="w-full h-11 px-4 bg-card border border-border rounded-custom text-sm text-text-main focus:outline-none focus:border-primary"
            >
              <option value="Fridge">Fridge (Default)</option>
              <option value="Freezer">Freezer</option>
              <option value="Pantry">Pantry</option>
            </select>
          </div>

          <div className="flex gap-2.5 mt-2 border-t border-border/60 pt-4 justify-end">
            <Button onClick={() => setIsTransferModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Move to Pantry
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ShoppingList;
