import { defineStore } from 'pinia'
import { getBusinessByRepittCodeAsCurrentCompany } from '@/services/company/businesses'

interface SubscriptionData {
  status: string
  planName: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  cancelAt: string | null
  canceledAt?: string | null
  createdAt?: string
}

export const useCompanyStore = defineStore('company', {
  state: () => ({
    selectedCompany: {
      id: null,
      name: null,
      description: null,
      address: null,
      phone: null,
      businessRepittCode: null as string | null,
      openingHours: null,
      logoPath: null,
      isActive: null,
      category: {
        id: null,
        name: null,
      },
      stampCards: [] as any[],
    },
    businessSubscription: null as SubscriptionData | null,
  }),
  getters: {
    company: state => state.selectedCompany,
    subscription: state => state.businessSubscription,
    isSubscribed: state => {
      const s = state.businessSubscription?.status
      return s === 'active' || s === 'trialing' || s === 'past_due'
    },
    isPastDue: state => state.businessSubscription?.status === 'past_due',
  },
  actions: {
    selectCompany(company: any) {
      if (!company)
        return

      this.selectedCompany = {
        id: company.id,
        name: company.name,
        description: company.description,
        address: company.address,
        phone: company.phone,
        businessRepittCode: company.businessRepittCode || company.business_repitt_code,
        openingHours: company.openingHours || company.opening_hours,
        logoPath: company.logoPath || company.logo_path,
        isActive: typeof company.isActive !== 'undefined' ? company.isActive : company.is_active,
        category: company.category || company.segment,
        stampCards: company.stampCards || company.stamp_cards || [],
      }
    },
    setBusinessSubscription(data: SubscriptionData | null) {
      this.businessSubscription = data
    },
    async refreshCompany(repittCode: string) {
      if (!repittCode)
        return

      const res = await getBusinessByRepittCodeAsCurrentCompany(repittCode)

      this.selectCompany(res)
    },
    deleteCompanyData() {
      this.selectedCompany = {
        id: null,
        name: null,
        description: null,
        address: null,
        phone: null,
        businessRepittCode: null,
        openingHours: null,
        logoPath: null,
        isActive: null,
        category: {
          id: null,
          name: null,
        },
        stampCards: [],
      }
      this.businessSubscription = null
    },
  },
  persist: true,
})
