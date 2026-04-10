import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // warning, danger, info
}) => {
  if (!isOpen) return null

  const typeStyles = {
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700',
      icon: '⚠️',
    },
    danger: {
      button: 'bg-red-600 hover:bg-red-700',
      icon: '🗑️',
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700',
      icon: 'ℹ️',
    },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-4xl">{typeStyles[type].icon}</span>
          <h3 className="text-xl font-semibold mt-2">{title}</h3>
          <p className="text-gray-600 mt-2">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 btn text-white ${typeStyles[type].button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog