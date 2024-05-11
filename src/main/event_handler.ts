import { ipcMain } from 'electron'
import DataGenerator, { DataGenOptions } from './data_generator_custom'

function registerEventHandler() {
  ipcMain.on('generate-data', (_, options: DataGenOptions) => {
    try {
      new DataGenerator().gridGenerator(options)
    } catch (e: any) {
      console.log(e.stack)
    }
  })
}

export default registerEventHandler
