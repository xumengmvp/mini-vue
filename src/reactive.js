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
    this.subscribers.forEach(effect => {
      effect()
    })
  }
}

let activeEffect = null;

let targetMap = new WeakMap()

const dep = new Dep()

function watchEffect(effect) {
  activeEffect = effect
  effect()
  activeEffect = null
}

// 构造依赖数据结构, 对对象的每个key做劫持，创建key的依赖
// {obj, {key1: dep2(), key2: dep2()}}
function getDep(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)

  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

// 数据劫持 vue2
// function reactive(raw) {
//   Object.keys(raw).forEach(key => {
//     const dep = getDep(raw, key)
//     let value = raw[`${key}`]
//     Object.defineProperty(raw, key, {
//       get() {
//         dep.depend()
//         return value
//         return raw[`${key}`] // 会产生循环调用， 不是使用
//       },
//       set(newValue) {
//         value = newValue
//         dep.notify()
//       }
//     })
//   })

//   return raw // 返回的原始对象
// }


// 数据劫持 vue3
function reactive(raw) {
  // 返回的proxy对象
  return new Proxy(raw, {
    get(target, key, recevier) {
      const dep = getDep(raw, key)
      dep.depend()
      return raw[`${key}`] // 不会产生循环调用 
    },
    set(target, key, newValue) {
      const dep = getDep(raw, key)
      raw[`${key}`] = newValue
      dep.notify()
    }
  })
}
