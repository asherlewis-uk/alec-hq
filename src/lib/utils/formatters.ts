import { format, formatDistanceToNow } from 'date-fns'

export const formatDate = (date: string | Date) => {
  return format(new Date(date), 'MMM d, yyyy')
}

export const formatDateShort = (date: string | Date) => {
  return format(new Date(date), 'MMM d')
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const formatMileage = (mileage: number) => {
  return new Intl.NumberFormat('en-US').format(mileage) + ' mi'
}

export const timeAgo = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    VEHICLE: '🏍️ Garage',
    RIG: '💻 Rig',
    PERIPHERAL: '⌨️ Peripheral',
    NETWORK: '🌐 Network',
  }
  return labels[category] || category
}

export const getCategoryEmoji = (category: string): string => {
  const emojis: Record<string, string> = {
    VEHICLE: '🏍️',
    RIG: '💻',
    PERIPHERAL: '⌨️',
    NETWORK: '🌐',
  }
  return emojis[category] || '📦'
}

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ACTIVE: 'glass-success',
    STORED: 'glass-warning',
    SOLD: 'glass-danger',
    WISHLIST: 'glass-accent',
  }
  return colors[status] || 'glass'
}

export const getConditionColor = (condition: string): string => {
  const colors: Record<string, string> = {
    STOCK: 'border-blue-500/30',
    UPGRADED: 'border-accent/30',
    AFTERMARKET: 'border-purple-500/30',
    WORN: 'border-yellow-500/30',
    FAILED: 'border-red-500/30',
  }
  return colors[condition] || 'border-white/10'
}

export const getLogTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    MAINTENANCE: '🔧',
    UPGRADE: '⬆️',
    REPAIR: '🛠️',
    INSPECTION: '👀',
    NOTE: '📝',
  }
  return icons[type] || '📋'
}