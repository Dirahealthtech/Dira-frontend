import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from './CartContext.jsx';
import { useAuth } from '../../auth/AuthContext';

const AddToCartButton = ({ 
  productId, 
  initialQuantity = 1, 
  showQuantityControls = false,
  size = 'medium',
  variant = 'primary',
  disabled = false,
  onSuccess,
  onLoginRedirect, // New prop for custom login redirect handler
  loginPath = '/login', // Default login path
  className = ''
}) => {
  const { addToCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      if (onLoginRedirect) {
        onLoginRedirect();
      } else {
        // Default redirect behavior (you can customize this based on your routing setup)
        window.location.href = loginPath;
        // For React Router, you might use:
        // navigate(loginPath);
      }
      return;
    }

    // If disabled or no productId, don't proceed
    if (!productId || disabled) {
      return;
    }

    setIsAdding(true);
    const success = await addToCart(productId, quantity);
    setIsAdding(false);

    if (success && onSuccess) {
      onSuccess();
    }
  };

  // Size configurations
  const sizeClasses = {
    small: {
      button: 'px-3 py-2 text-sm',
      icon: 'h-4 w-4',
      quantityControl: 'px-2 py-1 text-sm'
    },
    medium: {
      button: 'px-4 py-2',
      icon: 'h-5 w-5',
      quantityControl: 'px-3 py-2'
    },
    large: {
      button: 'px-6 py-3 text-lg',
      icon: 'h-6 w-6',
      quantityControl: 'px-4 py-3'
    }
  };

  // Variant configurations
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white disabled:border-blue-300 disabled:text-blue-300',
    ghost: 'text-blue-600 hover:bg-blue-50 disabled:text-blue-300'
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  // Only disable for actual disabled prop or loading states, not authentication
  const isButtonDisabled = disabled || isLoading || isAdding;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Quantity Controls - only show if authenticated */}
      {showQuantityControls && isAuthenticated && (
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className={`${currentSize.quantityControl} hover:bg-gray-50 disabled:opacity-50 transition-colors rounded-l-lg`}
          >
            <Minus className={currentSize.icon} />
          </button>
          <span className={`${currentSize.quantityControl} border-x border-gray-300 font-medium min-w-[3rem] text-center`}>
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className={`${currentSize.quantityControl} hover:bg-gray-50 transition-colors rounded-r-lg`}
          >
            <Plus className={currentSize.icon} />
          </button>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isButtonDisabled}
        className={`
          ${currentSize.button} 
          ${currentVariant} w-full
          rounded-lg font-medium transition-all duration-200 
          disabled:cursor-not-allowed disabled:opacity-50
          flex items-center justify-center space-x-2
          ${isAdding ? 'transform scale-95' : 'transform scale-100'}
        `}
      >
        <ShoppingCart className={`${currentSize.icon} ${isAdding ? 'animate-bounce' : ''}`} />
        <span>
          {!isAuthenticated ? 'Add to Cart' :
           isAdding ? 'Adding...' : 
           showQuantityControls ? `Add ${quantity} to Cart` : 'Add to Cart'}
        </span>
      </button>
    </div>
  );
};

export default AddToCartButton;