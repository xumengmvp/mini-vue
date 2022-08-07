// 渲染器函数的实现
const h = (tag, props, children) => {
  return {
    tag,
    props,
    children
  }
}

// vnode -> dom
const mount = (vnode, container) => {
  // 1.根据虚拟vnode创建真实el, 并在vnode保留el
  const el = vnode.el = document.createElement(vnode.tag)

  // 2.处理props
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key]
      // 处理事件
      if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }
    }
  }

  // 3.处理children
  if(vnode.children) {
    if (typeof vnode.children === "string") {
      el.textContent = vnode.children
    } else { // 数组
      for (const children of vnode.children) {
        mount(children, el)
      }
    }
  }
  // 4.将el挂载到container上
  container.appendChild(el)
}

// diff -> new vnode
const patch = (n1, n2) => {
  if (n1.tag !== n2.tag) {
    const parentElement = n1.el.parentElement
    parentElement.removeChild(n1.el)
    mount(n2, parentElement)
  } else {
    // 1.取出element对象，并在新节点vnode2中保存
    const el = n2.el = n1.el
    
    // 2.处理props
    const n1Props = n1.props || {}
    const n2Props = n2.props || {}

    // 2.1获取所有的n2Props, 添加到el
    for(const key in n2Props) {
      const value = n2Props[key]
      const n1Value = n1Props[key]
      if (key in n1Props) {
        if (key.startsWith("on")) {
          el.removeEventListener(key.slice(2).toLowerCase(), n1Value)
          el.addEventListener(key.slice(2).toLowerCase(), value)
        } else if (value != n1Value) {
          el.setAttribute(key, value)
        }
      } else if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }
    }

    //2.2 删除旧的props
    for(const key in n1Props) {
      if (!(key in n2Props)) {
        if (key.startsWith("on")) {
          el.removeEventListener(key.slice(2).toLowerCase(), n1Props[key])
        } else {
          el.removeAttribute(key)
        }
      }
    }

    //3.处理children
    const n1Children = n1.children || []
    const n2Children = n2.children || []

    if (typeof n2Children === "string") {
      if (n1Children !== n2Children) {
        el.textContent = n2Children
      }
    } else { // n2Children是一个数组
      if (typeof n1Children === "string") {
        el.textContent = ""
        for (const children of  n2Children) {
          mount(children, el)
        }
      } else {

        /*
           // 不考虑key进行patch操作 -> diff算法
           n1Children: [v1, v2, v3, v4, v5]
           n2Children: [v1, v2, v3, v4, v5, v6]

           n1Children: [v1, v2, v3, v4, v5]
           n2Children: [v1, v2, v3]
        */
        const commonLength = Math.min(n1Children.length, n2Children.length)

        for(let i = 0; i < commonLength; i++) {
          patch(n1Children[i], n2Children[i])
        }

        // 卸载操作
        if (n1Children.length > n2Children.length) {
          for(let i = commonLength; i < n1Children.length; i++) {
            el.removeChild(n1Children[i].el)
          }
        }
        
        // 挂载操作 mount
        if (n2Children.length > n1Children.length) {
          for(let i = commonLength; i < n2Children.length; i++) {
            mount(n2Children[i], el)
          }
        }

      }
    }

  }
}