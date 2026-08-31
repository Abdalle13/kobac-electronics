import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchProducts } from '../../redux/slices/productSlice';
import api from '../../utils/api';
import Modal from './Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const blank = { name: '', brand: '', category: 'Phone', description: '', price: 0, costPrice: 0, countInStock: 0, ram: '', storage: '', processor: '' };

const ProductModal = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const editing = Boolean(product);
  const [form, setForm] = useState(
    editing
      ? {
          name: product.name, brand: product.brand, category: product.category,
          description: product.description, price: product.price, costPrice: product.costPrice || 0,
          countInStock: product.countInStock,
          ram: product.technicalSpecs?.ram || '', storage: product.technicalSpecs?.storage || '',
          processor: product.technicalSpecs?.processor || '',
        }
      : blank
  );
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let image = product?.images?.[0] || '';
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const res = await api.post('/upload', fd);
        image = res.data;
      }
      const payload = {
        name: form.name, brand: form.brand, category: form.category, description: form.description,
        price: Number(form.price), costPrice: Number(form.costPrice) || 0, countInStock: Number(form.countInStock),
        technicalSpecs: { ram: form.ram, storage: form.storage, processor: form.processor },
        images: image ? [image] : [],
      };

      let id = product?._id;
      if (!editing) {
        const created = await api.post('/products');
        id = created.data._id;
      }
      await api.put(`/products/${id}`, payload);

      toast.success(editing ? 'Product updated' : 'Product created');
      dispatch(fetchProducts({ limit: 1000 }));
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? 'Edit Product' : 'Add New Product'}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="product-form" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Update Product' : 'Create Product'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Name" required value={form.name} onChange={set('name')} />
          <Input label="Brand" required value={form.brand} onChange={set('brand')} />
          <Input label="Category" placeholder="Phone, Laptop, Gaming…" required value={form.category} onChange={set('category')} />
          <div className="flex flex-col mb-5">
            <label className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="bg-surface border border-line rounded-xl px-3 py-2 text-fg text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary"
            />
            {editing && !imageFile && <p className="text-xs text-muted mt-1">Leave blank to keep current image</p>}
          </div>
          <Input label="Sale price ($)" type="number" step="0.01" required value={form.price} onChange={set('price')} />
          <Input label="Cost price ($)" type="number" step="0.01" min="0" placeholder="What you pay the supplier" value={form.costPrice} onChange={set('costPrice')} />
          <Input label="Stock Count" type="number" required value={form.countInStock} onChange={set('countInStock')} />
          {Number(form.price) > 0 && Number(form.costPrice) > 0 && (
            <div className="flex flex-col mb-5 justify-end">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1.5">Margin</p>
              <p className="text-sm font-semibold text-fg">
                ${(Number(form.price) - Number(form.costPrice)).toFixed(2)}{' '}
                <span className="text-muted font-normal">
                  ({(((Number(form.price) - Number(form.costPrice)) / Number(form.price)) * 100).toFixed(0)}%)
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col mb-5">
          <label className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">Description</label>
          <textarea
            required
            value={form.description}
            onChange={set('description')}
            className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-sm text-fg focus:outline-none focus:border-primary/50 min-h-[100px]"
          />
        </div>

        <div className="border border-line rounded-xl p-4 bg-surface">
          <h3 className="text-sm font-medium text-muted mb-4">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Processor" value={form.processor} onChange={set('processor')} className="mb-0" />
            <Input label="RAM" value={form.ram} onChange={set('ram')} className="mb-0" />
            <Input label="Storage" value={form.storage} onChange={set('storage')} className="mb-0" />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
