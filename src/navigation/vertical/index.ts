import company from './company'
import visitor from './visitor'
import type { VerticalNavItems } from '@/@layouts/types'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// If user role is visitor, return visitor navigation
const navigation: VerticalNavItems = authStore.role === 'Visitor'
  ? [...visitor]
  : [...company, ...visitor]

export default navigation
