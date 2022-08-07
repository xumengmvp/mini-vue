class Dep {
  constructor() {
    this.subscribers = new Set()
  }

  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }

  notify() {
    this.subscribers.forEach((effect) => {
      effect()
    })
  }
}

let activeEffect = null

function watchEffect(effect) {
  activeEffect = effect
  effect()
  activeEffect = null
}

const targetMap = new WeakMap();

function getDep(target, key) {
  // 根据target对象找到depsMap对象
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target,depsMap)
  }

  // 根据key值找到dep对象
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

// 数据劫持 vue2, 不能劫持新加的属性，必须Vue.$set(), 重新设置代理
// function reactive(raw) {
//   Object.keys(raw).forEach(key => {
//     const dep = getDep(raw, key)
//     let value = raw[key]
//     Object.defineProperty(raw, key, {
//       get() {
//         dep.depend()
//         return value
//       },
//       set(newValue) {
//         value = newValue
//         dep.notify()
//       }
//     })
//   })
//   return raw
// }

// 数据劫持 vue3, Proxy不兼容IE浏览器, 具有更多的api, has, deleteProperty等
function reactive(raw) {
  return new Proxy(raw, {
    get(target, property, receiver) {
      const dep = getDep(target, property)
      dep.depend()
      return target[property]
    },
    set(target, property, newValue, receiver) {
      const dep = getDep(target, property)
      target[property] = newValue
      dep.notify()
    }
  })
}



// 例子
const info = reactive({ counter: 0, name: "张三" })

watchEffect(function doubleCounter() {
  console.log(info.counter * 2, info.name)  // -> 触发数据劫持
})

watchEffect(function powerCounter() {
  console.log(info.counter * info.counter) // -> 触发数据劫持
})