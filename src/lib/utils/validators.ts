export const validateAssetName = (name: string): boolean => {
  return name.trim().length > 0 && name.length <= 100
}

export const validateComponentName = (name: string): boolean => {
  return name.trim().length > 0 && name.length <= 100
}

export const validatePrice = (price: string): boolean => {
  const num = parseFloat(price)
  return !isNaN(num) && num >= 0
}

export const validateMileage = (mileage: string): boolean => {
  const num = parseFloat(mileage)
  return !isNaN(num) && num >= 0
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}