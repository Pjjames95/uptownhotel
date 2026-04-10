/**
 * File Upload Validation and Processing
 */

const FILE_LIMITS = {
  image: { maxSize: 5 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] },
  pdf: { maxSize: 2 * 1024 * 1024, types: ['application/pdf'] },
  document: { maxSize: 10 * 1024 * 1024, types: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
}

export const validateImageFile = (file) => {
  const { maxSize, types } = FILE_LIMITS.image
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' }
  }
  
  if (!types.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' }
  }
  
  return { valid: true }
}

export const validatePdfFile = (file) => {
  const { maxSize, types } = FILE_LIMITS.pdf
  
  if (file.size > maxSize) {
    return { valid: false, error: 'PDF size must be less than 2MB' }
  }
  
  if (!types.includes(file.type)) {
    return { valid: false, error: 'Only PDF files are allowed' }
  }
  
  return { valid: true }
}

// Compress image before upload
export const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Max dimensions 2000x2000
        if (width > height) {
          if (width > 2000) {
            height *= 2000 / width
            width = 2000
          }
        } else {
          if (height > 2000) {
            width *= 2000 / height
            height = 2000
          }
        }
        
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }))
        }, 'image/jpeg', 0.85)
      }
      
      img.src = e.target.result
    }
    
    reader.readAsDataURL(file)
  })
}

// Generate unique filename
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  return `${timestamp}_${random}.${extension}`
}