class MemoryMonitor {
  constructor() {
    this.initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
    this.leaks = new Set()
  }

  checkForLeaks() {
    if (!performance.memory) {
      console.warn('Performance Memory API not available')
      return
    }

    const currentMemory = performance.memory.usedJSHeapSize
    const diff = currentMemory - this.initialMemory
    const diffMB = (diff / 1024 / 1024).toFixed(2)

    if (diff > 5 * 1024 * 1024) { // 5 MB
      console.error(`⚠️ ВОЗМОЖНА УТЕЧКА ПАМЯТИ: +${diffMB}MB`)
      this.takeHeapSnapshot()
    }
  }

  takeHeapSnapshot() {
    // В реальном приложении используйте Chrome DevTools Protocol
    console.takeHeapSnapshot?.() // Для расширений DevTools
  }

  trackComponent() {
    const id = Math.random().toString(36).substr(2, 9)
    this.leaks.add(id)
    
    return () => {
      this.leaks.delete(id)
    }
  }
}

export const memoryMonitor = new MemoryMonitor()
