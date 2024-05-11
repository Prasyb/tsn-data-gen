import { defineStore } from 'pinia'

export const useTopoDataStore = defineStore('topo_data', {
  state: () => {
    return {
      topoDataJson: '',
      isUpToDate: false
    }
  }
})
