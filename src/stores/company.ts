import { defineStore } from 'pinia'

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
  },
  persist: true,
})
