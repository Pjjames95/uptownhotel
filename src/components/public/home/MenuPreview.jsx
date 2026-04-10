import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { formatCurrency } from '../../../utils/currency'

const MenuPreview = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .limit(6)

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Featured Menu Items</h2>

        {loading ? (
          <div className="text-center py-10">
            <p>Loading menu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map(item => (
              <div key={item.id} className="card hover:shadow-lg transition">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                {item.dietary_tags?.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {item.dietary_tags.slice(0, 2).map(tag => (
                      <span key={tag} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(item.price)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/restaurant" className="btn btn-primary">
            View Full Menu
          </Link>
        </div>
      </div>
    </section>
  )
}

export default MenuPreview