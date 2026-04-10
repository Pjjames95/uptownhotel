import React, { useState } from 'react'
import { formatCurrency } from '../../../utils/currency'
import { DIETARY_TAGS } from '../../../utils/constants'
import { MagnifyingGlassIcon, FireIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

const MenuDisplay = ({ categories, items, loading }) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDietary, setSelectedDietary] = useState([])

  const handleDietaryToggle = (tag) => {
    setSelectedDietary(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const filteredItems = items.filter(item => {
    // Filter by category
    if (selectedCategory !== 'all' && item.category_id !== selectedCategory) {
      return false
    }

    // Filter by search
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter by dietary tags
    if (selectedDietary.length > 0) {
      const itemTags = item.dietary_tags || []
      if (!selectedDietary.every(tag => itemTags.includes(tag))) {
        return false
      }
    }

    return true
  })

  // Group items by category for display
  const groupedItems = () => {
    if (selectedCategory !== 'all') {
      const category = categories.find(c => c.id === selectedCategory)
      return { [category?.name || 'Items']: filteredItems }
    }

    const grouped = {}
    categories.forEach(category => {
      const categoryItems = filteredItems.filter(item => item.category_id === category.id)
      if (categoryItems.length > 0) {
        grouped[category.name] = categoryItems
      }
    })
    return grouped
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="mt-4 text-gray-600">Loading menu...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Menu</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover our carefully crafted dishes made with the finest ingredients
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-6 py-2 rounded-full transition ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Items
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-2 rounded-full transition ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Dietary Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <span className="text-sm text-gray-600 mr-2">Filter by:</span>
        {DIETARY_TAGS.slice(0, 6).map(tag => (
          <button
            key={tag}
            onClick={() => handleDietaryToggle(tag)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              selectedDietary.includes(tag)
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      {Object.keys(groupedItems()).length > 0 ? (
        <div className="space-y-12">
          {Object.entries(groupedItems()).map(([categoryName, categoryItems]) => (
            <div key={categoryName}>
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-blue-600 inline-block">
                {categoryName}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryItems.map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">No menu items found</p>
          {(searchQuery || selectedDietary.length > 0) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedDietary([])
                setSelectedCategory('all')
              }}
              className="btn btn-secondary mt-4"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const MenuItemCard = ({ item }) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="card hover:shadow-lg transition group">
      {/* Image */}
      {item.image_url ? (
        <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          />
          {!item.is_available && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}
          {item.is_seasonal && (
            <div className="absolute top-2 left-2">
              <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <StarSolidIcon className="w-3 h-3" />
                Seasonal
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-4xl">🍽️</span>
        </div>
      )}

      {/* Content */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold">{item.name}</h3>
        <span className="text-xl font-bold text-blue-600">
          {formatCurrency(item.price)}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {item.description || 'A delicious dish prepared with care.'}
      </p>

      {/* Dietary Tags */}
      {item.dietary_tags && item.dietary_tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.dietary_tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
          {item.dietary_tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{item.dietary_tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Expandable Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm text-blue-600 hover:underline mb-2"
      >
        {showDetails ? 'Hide details' : 'Show details'}
      </button>

      {showDetails && (
        <div className="mt-3 pt-3 border-t text-sm">
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="mb-2">
              <span className="font-medium text-gray-700">Ingredients:</span>
              <p className="text-gray-600">{item.ingredients.join(', ')}</p>
            </div>
          )}
          
          {item.allergens && item.allergens.length > 0 && (
            <div className="mb-2">
              <span className="font-medium text-gray-700">Allergens:</span>
              <p className="text-red-600">{item.allergens.join(', ')}</p>
            </div>
          )}

          {item.preparation_time_minutes && (
            <div className="flex items-center gap-1 text-gray-600">
              <FireIcon className="w-4 h-4" />
              <span>Prep time: {item.preparation_time_minutes} mins</span>
            </div>
          )}
        </div>
      )}

      {/* Availability Badge */}
      <div className="mt-3">
        {item.is_available ? (
          <span className="text-green-600 text-sm flex items-center gap-1">
            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
            Available
          </span>
        ) : (
          <span className="text-red-600 text-sm flex items-center gap-1">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Currently Unavailable
          </span>
        )}
      </div>
    </div>
  )
}

export default MenuDisplay