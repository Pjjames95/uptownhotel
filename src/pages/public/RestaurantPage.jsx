import React, { useState } from 'react'
import { useMenu } from '../../hooks/useMenu'
import MenuDisplay from '../../components/public/restaurant/MenuDisplay'
import TableReservation from '../../components/public/restaurant/TableReservation'
import PublicLayout from '../../components/public/layout/PublicLayout'

const RestaurantPage = () => {
  const { categories, items, loading } = useMenu()
  const [showReservation, setShowReservation] = useState(false)

  return (
    <PublicLayout>
      <div className="py-10">
        <h1 className="text-4xl font-bold text-center mb-10">Restaurant</h1>

        {showReservation ? (
          <TableReservation onBack={() => setShowReservation(false)} />
        ) : (
          <>
            <MenuDisplay categories={categories} items={items} loading={loading} />
            <div className="text-center mt-10">
              <button
                onClick={() => setShowReservation(true)}
                className="btn btn-primary"
              >
                Reserve a Table
              </button>
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  )
}

export default RestaurantPage