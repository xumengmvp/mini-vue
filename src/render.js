// children 的类型暂定数组或者字符串， 对象slots暂不考虑
const h = (tag, props, children) => {
  return {
    tag,
    props,
    children
  }
}

const mount = (vnode, container) => {
  // 创建真实元素，保存el属性
  const vnodeWarp = vnode.el =  document.createElement(vnode.tag)

  // 设置标签属性
  if (vnode.props) {
    for (attr in vnode.props) {
      if (attr.startsWith("on")) {
        vnodeWarp.addEventListener(attr.slice(2).toLowerCase(), vnode.props[`${attr}`])
      } else {
        vnodeWarp.setAttribute(attr, vnode.props[`${attr}`])
      }
    }
  }

  // 处理childern节点
  if (typeof vnode.children === "string") {
    vnodeWarp.textContent = vnode.children
  } else {
    vnode.children.forEach(item => {
      mount(item, vnodeWarp)
    })
  }

  container.appendChild(vnodeWarp)
}


const patch = (node1, node2) => {
  if (node1.tag !== node2.tag) {  // 比较类型是否相同, 类型不相同直接进行替换
    const node1Parent = node1.el.parentElement; // 获取父节点
    node1Parent.removeChild(node1.el)
    mount(vnode2, node1Parent)
  } else { // 类型相同，处理props和children

    // 取出el dom对象
    const el = node2.el = node1.el

    // 处理props
    node1.props = node1.props || {}
    node2.props = node2.props || {}

    // 增加合并props
    for (const attr in node2.props) {
      if (attr in node1.props) {
        if (node1.props[`${attr}`] !== node2.props[`${attr}`]) {
          if (attr.startsWith("on")) {
            el.addEventListener(attr.slice(2).toLowerCase(), node2.props[`${attr}`])
          } else {
            el.setAttribute(attr, node2.props[`${attr}`])
          }
        }
      } else {
        if (attr.startsWith("on")) {
          el.addEventListener(attr.slice(2).toLowerCase(), node2.props[`${attr}`])
        } else {
          el.setAttribute(attr, node2.props[`${attr}`])
        }
      }
    }

    // 删除props
    for (const attr in node1.props) {
      if (!(attr in node2.props)) {
        if (attr.startsWith("on")) {
          el.removeEventListener(attr.slice(2).toLowerCase(), node2.props[`${attr}`])
        } else {
          el.removeAttribute(attr, node2.props[`${attr}`])
        }
      }
    }

    // edge case maybe small / 字符串
    if (typeof node2.children === "string") {
      el.innerHTML = node2.children
    } else { // 数组
      if (typeof node1.children === "string") {
        el.innerHTML = ""
        for(const vnode of node2.children) {
          mount(vnode, el)
        }
      } else {
        // (不考虑有key的情况) 进行children patch
        // 有key时，可以进行算法优化 differ 算法

        node1.children = node1.children || []
        node2.children = node2.children || []

        const commonLength = Math.min(node1.children.length, node2.children.length)

        for (let i = 0; i < commonLength; i++) {
          patch(node1.children[i], node2.children[i]) // 子节点继续patch操作
        }
        
        // 旧节点大于新节点
        if (node1.children.length > node2.children.length) {
          for (let i = commonLength; i < node1.children.length; i++) {
            el.removeChild(node1.children[i].el) // 卸载节点
          }
        } else {
          // 新节点大于旧节点， 挂载节点
          for (let i = commonLength; i < node2.children.length; i++) {
            mount(node2.children[i], el)
          }
        }
      }
    }
  }
}