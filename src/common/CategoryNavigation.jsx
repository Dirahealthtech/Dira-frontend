import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import api from '../auth/api';

const CategoryNavigation = () => {
  const [categories, setCategories] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const categoryRefs = useRef({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/v1/admin/list-categories');
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

  const handleMouseEnter = (categoryId) => {
    if (categoryRefs.current[categoryId]) {
      const rect = categoryRefs.current[categoryId].getBoundingClientRect();
      const containerRect = categoryRefs.current[categoryId].closest('.container').getBoundingClientRect();
      
      setDropdownPosition({
        left: rect.left - containerRect.left,
        top: rect.bottom - containerRect.top
      });
      setActiveDropdown(categoryId);
    }
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
      <div className="container mx-auto px-4 py-3 relative">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {organizedCategories.map((category) => (
            <div 
              key={category.id} 
              ref={el => categoryRefs.current[category.id] = el}
              className="flex-shrink-0"
              onMouseEnter={() => category.children.length > 0 && handleMouseEnter(category.id)}
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
        
        {/* Dropdown positioned using calculated coordinates */}
        {organizedCategories.map((category) => (
          category.children.length > 0 && activeDropdown === category.id && (
            <div 
              key={`dropdown-${category.id}`}
              className="absolute bg-white border border-gray-200 rounded-md shadow-lg min-w-48 z-[100] py-1"
              style={{
                left: `${dropdownPosition.left}px`,
                top: `${dropdownPosition.top + 2}px`
              }}
              onMouseEnter={() => setActiveDropdown(category.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {category.children.map((child, index) => (
                <div key={child.id}>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategoryClick(child);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {child.name}
                  </a>
                  {index < category.children.length - 1 && (
                    <div className="border-b border-gray-100 mx-2"></div>
                  )}
                </div>
              ))}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default CategoryNavigation;