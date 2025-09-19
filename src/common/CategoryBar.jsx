import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, MoreHorizontal, Menu, X } from 'lucide-react';
import api from '../auth/api';

const CategoryBar = () => {
  const [categories, setCategories] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
  const [loading, setLoading] = useState(true);
  const [visibleCategories, setVisibleCategories] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const categoryRefs = useRef({});
  const containerRef = useRef(null);
  const moreButtonRef = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    checkMobileView();
    
    const handleResize = () => {
      checkMobileView();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !isMobile) {
      calculateVisibleCategories();
      
      // Set up resize observer for desktop only
      if (containerRef.current && !resizeObserverRef.current) {
        resizeObserverRef.current = new ResizeObserver(() => {
          if (!isMobile) {
            calculateVisibleCategories();
          }
        });
        resizeObserverRef.current.observe(containerRef.current);
      }
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [categories, isMobile]);

  const checkMobileView = () => {
    const mobile = window.innerWidth < 768; // md breakpoint
    setIsMobile(mobile);
    if (mobile) {
      setShowMoreDropdown(false);
      setActiveDropdown(null);
    }
  };

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

  const organizeCategories = useCallback(() => {
    const parentCategories = categories.filter(cat => cat.parent_id === null);
    const childCategories = categories.filter(cat => cat.parent_id !== null);
    
    return parentCategories.map(parent => ({
      ...parent,
      children: childCategories.filter(child => child.parent_id === parent.id)
    }));
  }, [categories]);

  const calculateVisibleCategories = useCallback(() => {
    if (!containerRef.current || isMobile) return;

    const organizedCategories = organizeCategories();
    const containerWidth = containerRef.current.offsetWidth;
    const moreButtonWidth = 120;
    const padding = 32;
    const availableWidth = containerWidth - padding - moreButtonWidth;
    
    let currentWidth = 0;
    const visible = [];
    const hidden = [];

    organizedCategories.forEach((category, index) => {
      const categoryWidth = Math.min(category.name.length * 8 + 40 + (category.children.length > 0 ? 24 : 0), 200);
      
      if (currentWidth + categoryWidth <= availableWidth || (index === 0 && visible.length === 0)) {
        visible.push(category);
        currentWidth += categoryWidth + 4;
      } else {
        hidden.push(category);
      }
    });

    setVisibleCategories(visible);
    setHiddenCategories(hidden);
  }, [organizeCategories, isMobile]);

  const handleCategoryClick = (category) => {
    navigate(`/products/category/${category.slug}`, { 
      state: { categoryId: category.id, categoryName: category.name } 
    });
    setActiveDropdown(null);
    setShowMoreDropdown(false);
    setShowMobileMenu(false);
  };

  const handleMouseEnter = (categoryId) => {
    if (isMobile) return;
    
    if (categoryRefs.current[categoryId]) {
      const rect = categoryRefs.current[categoryId].getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      setDropdownPosition({
        left: rect.left - containerRect.left,
        top: rect.bottom - containerRect.top
      });
      setActiveDropdown(categoryId);
    }
  };

  const handleMoreClick = () => {
    if (isMobile) return;
    
    if (moreButtonRef.current && containerRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      setDropdownPosition({
        left: Math.min(rect.left - containerRect.left, containerRect.width - 200),
        top: rect.bottom - containerRect.top
      });
    }
    setShowMoreDropdown(!showMoreDropdown);
    setActiveDropdown(null);
  };

  const toggleMobileCategory = (categoryId) => {
    setActiveDropdown(activeDropdown === categoryId ? null : categoryId);
  };

  const handleClickOutside = useCallback((event) => {
    if (moreButtonRef.current && !moreButtonRef.current.contains(event.target)) {
      setShowMoreDropdown(false);
    }
  }, []);

  useEffect(() => {
    if (showMoreDropdown && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreDropdown, handleClickOutside, isMobile]);

  const organizedCategories = organizeCategories();

  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex space-x-6 animate-pulse">
            {[...Array(isMobile ? 2 : 5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded w-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle categories menu"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="mt-3 border-t border-gray-200 pt-3 max-h-96 overflow-y-auto">
              {organizedCategories.map((category) => (
                <div key={category.id} className="mb-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className="flex-1 text-left px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                    >
                      {category.name}
                    </button>
                    {category.children.length > 0 && (
                      <button
                        onClick={() => toggleMobileCategory(category.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={`Toggle ${category.name} subcategories`}
                      >
                        <ChevronDown 
                          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                            activeDropdown === category.id ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                    )}
                  </div>
                  
                  {/* Mobile Subcategories */}
                  {category.children.length > 0 && activeDropdown === category.id && (
                    <div className="ml-4 mt-2 space-y-1">
                      {category.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleCategoryClick(child)}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div ref={containerRef} className="container mx-auto px-4 py-3 relative">
        <div className="flex items-center space-x-1">
          {/* Visible Categories */}
          <div className="flex space-x-1 flex-1 min-w-0">
            {visibleCategories.map((category) => (
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
                  <span className="font-medium truncate max-w-32">{category.name}</span>
                  {category.children.length > 0 && (
                    <div className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0">
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

          {/* More Button */}
          {hiddenCategories.length > 0 && (
            <div 
              ref={moreButtonRef}
              className="flex-shrink-0"
            >
              <button
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap
                  ${showMoreDropdown 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'hover:bg-gray-100 text-gray-700'
                  }`}
                onClick={handleMoreClick}
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="font-medium">More</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                  showMoreDropdown ? 'rotate-180' : ''
                }`} />
              </button>
            </div>
          )}
        </div>
        
        {/* Category Children Dropdowns */}
        {visibleCategories.map((category) => (
          category.children.length > 0 && activeDropdown === category.id && (
            <div 
              key={`dropdown-${category.id}`}
              className="absolute bg-white border border-gray-200 rounded-md shadow-lg min-w-48 max-w-xs z-[100] py-1"
              style={{
                left: `${Math.min(dropdownPosition.left, window.innerWidth - 220)}px`,
                top: `${dropdownPosition.top + 2}px`
              }}
              onMouseEnter={() => setActiveDropdown(category.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {category.children.map((child, index) => (
                <div key={child.id}>
                  <button
                    onClick={() => handleCategoryClick(child)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors truncate"
                  >
                    {child.name}
                  </button>
                  {index < category.children.length - 1 && (
                    <div className="border-b border-gray-100 mx-2"></div>
                  )}
                </div>
              ))}
            </div>
          )
        ))}

        {/* More Dropdown */}
        {showMoreDropdown && hiddenCategories.length > 0 && (
          <div 
            className="absolute bg-white border border-gray-200 rounded-md shadow-lg min-w-48 max-w-xs z-[100] py-1"
            style={{
              left: `${dropdownPosition.left}px`,
              top: `${dropdownPosition.top + 2}px`
            }}
          >
            {hiddenCategories.map((category, index) => (
              <div key={category.id}>
                <div className="group relative">
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="flex items-center justify-between w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <span className="truncate pr-2">{category.name}</span>
                    {category.children.length > 0 && (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    )}
                  </button>
                  
                  {/* Nested dropdown for categories with children */}
                  {category.children.length > 0 && (
                    <div className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-48 max-w-xs py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      {category.children.map((child, childIndex) => (
                        <div key={child.id}>
                          <button
                            onClick={() => handleCategoryClick(child)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors truncate"
                          >
                            {child.name}
                          </button>
                          {childIndex < category.children.length - 1 && (
                            <div className="border-b border-gray-100 mx-2"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {index < hiddenCategories.length - 1 && (
                  <div className="border-b border-gray-100 mx-2"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryBar;