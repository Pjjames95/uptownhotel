import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { formatCurrency } from '../../../utils/currency'
import { DIETARY_TAGS, ALLERGENS } from '../../../utils/constants'
import ImageUploader from '../../common/ImageUploader'
import toast from 'react-hot-toast'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon 
} from '@heroicons/react/24/outline'

const MenuManager = () => {
  const { profile } = useAuth()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    ingredients: '',
    allergens: '',
    dietary_tags: [],
    preparation_time_minutes: '',
    is_available: true,
    is_seasonal: false,
  })

  // Permission check
  const canManageMenu = profile?.role && 
    ['super_admin', 'hotel_manager', 'restaurant_manager'].includes(profile.role)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (catError) throw catError

      // Fetch items
      const { data: itemData, error: itemError } = await supabase
        .from('menu_items')
        .select('*, category:menu_categories(name)')
        .order('name')

      if (itemError) throw itemError

      setCategories(catData || [])
      setItems(itemData || [])
      
      // Initialize all categories as expanded
      const expanded = {}
      catData?.forEach(cat => { expanded[cat.id] = true })
      setExpandedCategories(expanded)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load menu data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!canManageMenu) {
      toast.error('You do not have permission to manage the menu')
      return
    }

    try {
      const itemData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        image_url: formData.image_url || null,
        ingredients: formData.ingredients 
          ? formData.ingredients.split(',').map(i => i.trim()).filter(i => i)
          : [],
        allergens: formData.allergens 
          ? formData.allergens.split(',').map(a => a.trim()).filter(a => a)
          : [],
        dietary_tags: formData.dietary_tags,
        preparation_time_minutes: formData.preparation_time_minutes 
          ? parseInt(formData.preparation_time_minutes) 
          : null,
        is_available: formData.is_available,
        is_seasonal: formData.is_seasonal,
      }

      let result
      if (editingItem) {
        result = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id)
      } else {
        result = await supabase
          .from('menu_items')
          .insert([itemData])
      }

      const { error } = result

      if (error) {
        if (error.code === '42501') {
          toast.error('You do not have permission to manage menu items')
        } else {
          throw error
        }
        return
      }

      toast.success(editingItem ? 'Menu item updated' : 'Menu item created')
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error saving item:', error)
      toast.error('Failed to save menu item')
    }
  }

  const handleEdit = (item) => {
    if (!canManageMenu) {
      toast.error('You do not have permission to edit menu items')
      return
    }
    
    setEditingItem(item)
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category_id: item.category_id || '',
      image_url: item.image_url || '',
      ingredients: item.ingredients?.join(', ') || '',
      allergens: item.allergens?.join(', ') || '',
      dietary_tags: item.dietary_tags || [],
      preparation_time_minutes: item.preparation_time_minutes || '',
      is_available: item.is_available ?? true,
      is_seasonal: item.is_seasonal ?? false,
    })
    setShowForm(true)
  }

  const handleDelete = async (itemId) => {
    if (!canManageMenu) {
      toast.error('You do not have permission to delete menu items')
      return
    }
    
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      toast.success('Menu item deleted')
      fetchData()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete menu item')
    }
  }

  const handleToggleAvailability = async (itemId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !currentStatus })
        .eq('id', itemId)

      if (error) throw error
      fetchData()
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      ingredients: '',
      allergens: '',
      dietary_tags: [],
      preparation_time_minutes: '',
      is_available: true,
      is_seasonal: false,
    })
    setEditingItem(null)
    setShowForm(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleDietaryTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag)
        ? prev.dietary_tags.filter(t => t !== tag)
        : [...prev.dietary_tags, tag]
    }))
  }

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  // Group items by category
  const itemsByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = items.filter(item => item.category_id === cat.id)
    return acc
  }, {})

  const uncategorizedItems = items.filter(item => !item.category_id)

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Menu Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {canManageMenu ? '✓ You can manage menu items' : '👁️ View only mode'}
          </p>
        </div>
        
        {canManageMenu && (
          <button
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            {showForm ? (
              <>
                <XMarkIcon className="w-5 h-5" />
                Cancel
              </>
            ) : (
              <>
                <PlusIcon className="w-5 h-5" />
                Add Menu Item
              </>
            )}
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && canManageMenu && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h3 className="text-lg font-semibold">
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Image
            </label>
            <ImageUploader
              onUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
              existingImage={formData.image_url}
              bucket="menu-images"
              folder="items"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">Uncategorized</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (KES) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prep Time (minutes)
              </label>
              <input
                type="number"
                name="preparation_time_minutes"
                value={formData.preparation_time_minutes}
                onChange={handleChange}
                className="input"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredients (comma separated)
            </label>
            <input
              type="text"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Chicken, Rice, Vegetables"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allergens (comma separated)
            </label>
            <input
              type="text"
              name="allergens"
              value={formData.allergens}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Nuts, Dairy, Gluten"
            />
          </div>

          {/* Dietary Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleDietaryTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    formData.dietary_tags.includes(tag)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm">Available for order</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_seasonal"
                checked={formData.is_seasonal}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm">Seasonal item</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Update Item' : 'Create Item'}
            </button>
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Menu Display */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="mt-2 text-gray-600">Loading menu...</p>
          </div>
        ) : (
          <>
            {/* Categories with Items */}
            {categories.map(category => {
              const categoryItems = itemsByCategory[category.id] || []
              const isExpanded = expandedCategories[category.id]
              
              return (
                <div key={category.id} className="card">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex justify-between items-center"
                  >
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryItems.map(item => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleAvailability={handleToggleAvailability}
                          canManage={canManageMenu}
                        />
                      ))}
                      {categoryItems.length === 0 && (
                        <p className="text-gray-500 col-span-full text-center py-4">
                          No items in this category
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Uncategorized Items */}
            {uncategorizedItems.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Uncategorized</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uncategorizedItems.map(item => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleAvailability={handleToggleAvailability}
                      canManage={canManageMenu}
                    />
                  ))}
                </div>
              </div>
            )}

            {items.length === 0 && (
              <div className="text-center py-10 text-gray-600">
                <p className="text-lg">No menu items found</p>
                {canManageMenu && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary mt-4"
                  >
                    Add Your First Item
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Menu Item Card Component
const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailability, canManage }) => {
  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition relative ${!item.is_available ? 'opacity-60' : ''}`}>
      {/* Image */}
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-40 object-cover rounded-lg mb-3"
        />
      ) : (
        <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
          <span className="text-gray-400">No image</span>
        </div>
      )}

      {/* Seasonal Badge */}
      {item.is_seasonal && (
        <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
          Seasonal
        </span>
      )}

      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-lg">{item.name}</h4>
        <span className="font-bold text-blue-600">{formatCurrency(item.price)}</span>
      </div>

      {item.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
      )}

      {/* Dietary Tags */}
      {item.dietary_tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.dietary_tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {canManage && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <button
            onClick={() => onToggleAvailability(item.id, item.is_available)}
            className={`text-sm ${item.is_available ? 'text-green-600' : 'text-red-600'}`}
          >
            {item.is_available ? 'Available' : 'Unavailable'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuManager