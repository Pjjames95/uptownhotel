import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useMenu = () => {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error
      setCategories(data)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchMenuItems = async (categoryId = null) => {
    setLoading(true)
    try {
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query

      if (error) throw error
      setItems(data)
    } catch (err) {
      console.error('Error fetching menu items:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchMenuItems()
  }, [])

  return {
    categories,
    items,
    loading,
    fetchMenuItems,
  }
}