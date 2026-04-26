import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Plus, Minus, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { fetchProductDetails, clearProductDetails } from '../redux/slices/productSlice';
import { addToCart, toggleCart } from '../redux/slices/cartSlice';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, loading, error } = useSelector((state) => state.products);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    dispatch(fetchProductDetails(id));
    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, qty }));
    dispatch(toggleCart());
  };

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 w-full flex-grow flex items-center justify-center">
        <div className="animate-pulse w-full max-w-5xl">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-800 rounded-2xl w-full"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-800 rounded w-3/4"></div>
              <div className="h-6 bg-gray-800 rounded w-1/4"></div>
              <div className="h-24 bg-gray-800 rounded w-full"></div>
              <div className="h-12 bg-gray-800 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex-grow">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Product</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <Button onClick={() => navigate(-1)} variant="secondary">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
      
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square bg-[#111] rounded-2xl overflow-hidden border border-[var(--color-border)] p-4 flex items-center justify-center relative">
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="neutral">{product.category}</Badge>
            </div>
            <img 
              src={activeImage || '/placeholder.jpg'} 
              alt={product.name} 
              className="max-h-full max-w-full object-contain"
            />
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square bg-[#111] rounded-lg overflow-hidden border ${
                    activeImage === img ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/50' : 'border-[var(--color-border)] hover:border-gray-500'
                  } transition-all`}
                >
                  <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="mb-2 text-[#0066FF] font-semibold tracking-wider text-sm uppercase">
            {product.brand}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-extrabold text-white">${product.price.toLocaleString('en-US')}</span>
            {product.countInStock > 0 ? (
              <Badge variant="success" className="flex items-center gap-1">
                <Check className="w-3 h-3" /> In Stock ({product.countInStock} available)
              </Badge>
            ) : (
              <Badge variant="danger">Out of Stock</Badge>
            )}
          </div>

          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="bg-[#111] border border-[var(--color-border)] rounded-xl p-6 mb-8 mt-auto">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              
              <div className="w-full sm:w-1/3">
                <label className="block text-sm font-medium text-gray-400 mb-2">Quantity</label>
                <div className="flex items-center justify-between bg-[#0a0a0b] border border-gray-700 rounded-lg p-1">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-white font-medium">{qty}</span>
                  <button 
                    onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                    disabled={qty >= product.countInStock}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="w-full sm:w-2/3">
                <Button 
                  variant="primary" 
                  className="w-full py-3 h-[46px] flex items-center justify-center gap-2 text-lg"
                  onClick={handleAddToCart}
                  disabled={product.countInStock === 0}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>

            </div>
          </div>

          {/* Technical Specifications */}
          {product.technicalSpecs && (
            <div className="border border-[var(--color-border)] rounded-xl overflow-hidden mt-4">
              <div className="bg-[#111] px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-bold text-white">Technical Specifications</h3>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {product.technicalSpecs.processor && (
                  <div className="flex px-6 py-4 bg-[#0a0a0b]/50">
                    <div className="w-1/3 font-medium text-gray-400">Processor</div>
                    <div className="w-2/3 text-white">{product.technicalSpecs.processor}</div>
                  </div>
                )}
                {product.technicalSpecs.ram && (
                  <div className="flex px-6 py-4 bg-transparent">
                    <div className="w-1/3 font-medium text-gray-400">RAM</div>
                    <div className="w-2/3 text-white">{product.technicalSpecs.ram}</div>
                  </div>
                )}
                {product.technicalSpecs.storage && (
                  <div className="flex px-6 py-4 bg-[#0a0a0b]/50">
                    <div className="w-1/3 font-medium text-gray-400">Storage</div>
                    <div className="w-2/3 text-white">{product.technicalSpecs.storage}</div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
