// Updated CategoryNavigation component with proper dropdown visibility

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import api from '../auth/api';

const CategoryNavigation = () => {
  const [categories, setCategories] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/v1/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeCategories = () => {
    const parentCategories = categories.filter(cat => cat.parent_id === null);
    const childCategories = categories.filter(cat => cat.parent_id !== null);
    
    return parentCategories.map(parent => ({
      ...parent,
      children: childCategories.filter(child => child.parent_id === parent.id)
    }));
  };

  const handleCategoryClick = (category) => {
    navigate(`/products/${category.slug}`, { state: { categoryId: category.id, categoryName: category.name } });
    setActiveDropdown(null);
  };

  const toggleDropdown = (categoryId, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === categoryId ? null : categoryId);
  };

  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex space-x-6 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded w-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const organizedCategories = organizeCategories();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3">
        {/* Remove overflow-x-auto and add static positioning for dropdown container */}
        <div className="flex space-x-1">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {organizedCategories.map((category) => (
              <div 
                key={category.id} 
                className="relative flex-shrink-0"
                onMouseEnter={() => category.children.length > 0 && setActiveDropdown(category.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <div
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap
                    ${activeDropdown === category.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <span className="font-medium">{category.name}</span>
                  {category.children.length > 0 && (
                    <div className="p-1 hover:bg-gray-200 rounded transition-colors">
                      {activeDropdown === category.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Dropdown rendered outside the scrolling container */}
        {organizedCategories.map((category) => (
          category.children.length > 0 && activeDropdown === category.id && (
            <div 
              key={`dropdown-${category.id}`}
              className="absolute left-4 bg-white border border-gray-200 rounded-lg shadow-xl min-w-48 z-[100] mt-1"
              style={{
                top: '100%',
                transform: 'translateY(0)'
              }}
              onMouseEnter={() => setActiveDropdown(category.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className="py-2">
                {category.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleCategoryClick(child)}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default CategoryNavigation;