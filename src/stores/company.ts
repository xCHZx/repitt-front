import { defineStore } from 'pinia'
import { getBusinessByIdAsCurrentCompany } from '@/services/company/businesses'

export const useCompanyStore = defineStore('company', {
  state: () => ({
    selectedCompany: {
      address: null,
      description: null,
      id: null,
      logo_path: null,
      name: null,
      opening_hours: null,
      phone: null,
      is_active: null,
      segment: {
        id: null,
        name: null,
      },
    },
  }),
  getters: {
    company: state => state.selectedCompany,
  },
  actions: {
    selectCompany(companyId: any) {
      this.selectedCompany = companyId
    },
    async refreshCompany(businessId: any) {
      const res = await getBusinessByIdAsCurrentCompany(businessId)

      this.selectedCompany = res
    },
    deleteCompanyData() {
      this.selectedCompany = {
        address: null,
        description: null,
        id: null,
        logo_path: null,
        name: null,
        opening_hours: null,
        phone: null,
        is_active: null,
        segment: {
          id: null,
          name: null,
        },
      }
    },
  },
  persist: true,
})
