// directive to listen for clickaways.

const HANDLER = 'clickaway_handler'

const bind = (el: ObjectType, binding: ObjectType, vnode: ObjectType | null) => {
  unbind(el)
  const vm = vnode?.context
  const callback = binding.value
  let initialMacrotaskEnded = false
  setTimeout(() => {
    initialMacrotaskEnded = true
  })
  el[HANDLER] = function (event: ObjectType) {
    const path = event.path || (event.composedPath ? event.composedPath : undefined)

    if (initialMacrotaskEnded && (path ? path.indexOf(el) < 0 : !el.contains(event.target))) {
      callback.call(vm, event)
    }
  }
  document.documentElement.addEventListener('click', el[HANDLER], false)
}

const unbind = (el: ObjectType) => {
  document.documentElement.removeEventListener('click', el[HANDLER], false)
  delete el[HANDLER]
}

export const ClickAwayDirective = {
  bind,
  update: function (el: ObjectType, binding: ObjectType) {
    if (binding.value === binding.oldValue) return
    bind(el, binding, null)
  },
  unbind
}
