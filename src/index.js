function createApp(rootComponent) {

  return {
    mount(selector) {
      const container = document.querySelector(selector)
      let isMounted = false
      let oldVnode = null
      watchEffect(() => {
        if (!isMounted) {
          oldVnode = rootComponent.render()
          mount(oldVnode, container)
          isMounted = true
        } else {
          const newVnode = rootComponent.render()
          patch(oldVnode, newVnode)
          oldVnode = newVnode
        }
      })
    }
  }
}