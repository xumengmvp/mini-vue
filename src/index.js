const createApp = (rootElement) => {
  return {
    mount(selector) {
      const container = document.querySelector(selector)
      let isMounted = false
      let oldNode = null
      watchEffect(() => {
        if (!isMounted) {
          oldNode = rootElement.render()
          mount(oldNode, container)
          isMounted = true
        } else {
          const newNode = rootElement.render()
          patch(oldNode, newNode)
          oldNode = newNode
        }
      })
    }
  }
}