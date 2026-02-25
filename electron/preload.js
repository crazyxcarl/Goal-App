const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadData:        ()         => ipcRenderer.invoke('load-data'),
  saveData:        (data)     => ipcRenderer.invoke('save-data', data),
  loadCSV:         (filename) => ipcRenderer.invoke('load-csv', filename),
  loadMenuImage:   ()         => ipcRenderer.invoke('load-menu-image'),
  writeExcelTasks:   (payload)  => ipcRenderer.invoke('write-excel-tasks', payload),
  writeExcelFood:    (food)     => ipcRenderer.invoke('write-excel-food', food),
  writeExcelRewards: (rewards)  => ipcRenderer.invoke('write-excel-rewards', rewards),
});
