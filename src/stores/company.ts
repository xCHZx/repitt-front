import { defineStore } from 'pinia'
import { getByIdByCurrentCompany } from '@/services/company/businesses'

export const useCompanyStore = defineStore('company', {
  state: () => ({
    selectedCompany: null,
  }),
  getters: {
    company: state => state.selectedCompany,
  },
  actions: {
    selectCompany(companyId: any) {
      this.selectedCompany = companyId
    },
    async refreshCompany(businessId: any) {
      const res = await getByIdByCurrentCompany(businessId)

      this.selectedCompany = res
    },
  },
  persist: true,
})
