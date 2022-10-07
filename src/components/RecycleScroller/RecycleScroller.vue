<template>
  <div
    v-observe-visibility="handleVisibilityChange"
    class="vue-recycle-scroller"
    :class="{
      ready,
      'page-mode': pageMode,
      [`direction-${direction}`]: true
    }"
    @scroll.passive="handleScroll"
  >

    <div :style="{ [direction === 'vertical' ? 'minHeight' : 'minWidth']: totalSize + 'px' }" class="vue-recycle-scroller__item-wrapper">
      <div v-for="view of pool" :key="view.nr.id" :style="ready ? {[direction === 'vertical' ? 'top' : 'left'] : `${view.position}px`, willChange : 'unset'} : null" class="vue-recycle-scroller__item-view" :class="{ hover: hoverKey === view.nr.key }" @mouseenter="hoverKey = view.nr.key" @mouseleave="hoverKey = null">
        <slot :item="view.item" :index="view.nr.index" :active="view.nr.used" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { ObserveVisibility } from 'vue-observe-visibility'
import ScrollParent from 'scrollparent'

const ComponentProps = Vue.extend({
  props: {
    items: {
      type: Array,
      required: true
    },

    keyField: {
      type: String,
      default: 'id'
    },

    direction: {
      type: String,
      default: 'vertical',
      validator: (value) => ['vertical', 'horizontal'].includes(value)
    },

    itemSize: {
      type: Number,
      default: null
    },

    pageMode: {
      type: Boolean,
      default: false
    }
  }
})

// eslint-disable-next-line
@Component<RecycleScroller>({
  name: 'RecycleScroller',
  directives: {
    ObserveVisibility
  },
  watch: {
    items () {
      this.updateVisibleItems(true)
    },

    pageMode () {
      this.applyPageMode()
      this.updateVisibleItems(false)
    },

    sizes: {
      handler () {
        this.updateVisibleItems(false)
      },
      deep: true
    }
  }
})
export default class RecycleScroller extends ComponentProps {
  uid = 0
  pool = [] as Array<ObjectType>
  totalSize = 0
  ready = false
  hoverKey = null
  listenerTarget = null as null | Window
  startIndex = 0
  endIndex = 0
  views = new Map()
  unusedViews = new Map()
  scrollDirty = false
  lastUpdateScrollPosition = 0
  computedMinItemSize = 0
  refreshTimout = null as null | NodeJS.Timeout
  sortTimer = null as null | NodeJS.Timeout
  prerender = 0
  continuous = false

  mounted () {
    this.applyPageMode()
    this.$nextTick(() => {
      this.updateVisibleItems(true)
      this.ready = true
    })
  }

  beforeDestroy () {
    this.removeListeners()
  }

  get sizes () {
    if (this.itemSize === null) {
      const sizes = {
        '-1': { accumulator: 0 }
      } as ObjectType
      const items = this.items as Array<ObjectType>
      const minItemSize = 0
      let computedMinSize = 10000
      let accumulator = 0
      let current = 0
      for (let i = 0, l = items.length; i < l; i++) {
        current = minItemSize
        if (current < computedMinSize) {
          computedMinSize = current
        }
        accumulator += current
        sizes[i] = { accumulator, size: current }
      }
      // eslint-disable-next-line
      this.computedMinItemSize = computedMinSize
      return sizes
    }
    return []
  }

  get simpleArray () {
    return this.items.length && typeof this.items[0] !== 'object'
  }

  addView (pool: ObjectType, index: number, item: ObjectType, key: number, type: string) {
    const view = {
      item,
      position: 0
    } as any
    const nonReactive = {
      id: this.uid++,
      index,
      used: true,
      key,
      type
    }
    Object.defineProperty(view, 'nr', {
      configurable: false,
      value: nonReactive
    })
    pool.push(view)
    return view
  }

  unuseView (view: ObjectType, fake = false as boolean) {
    const unusedViews = this.unusedViews
    const type = view.nr.type
    let unusedPool = unusedViews.get(type)
    if (!unusedPool) {
      unusedPool = []
      unusedViews.set(type, unusedPool)
    }
    unusedPool.push(view)
    if (!fake) {
      view.nr.used = false
      view.position = -9999
      this.views.delete(view.nr.key)
    }
  }

  handleResize () {
    if (this.ready) this.updateVisibleItems(false)
  }

  handleScroll () {
    if (!this.scrollDirty) {
      this.scrollDirty = true
      requestAnimationFrame(() => {
        this.scrollDirty = false
        const { continuous } = this.updateVisibleItems(false, true)

        // It seems sometimes chrome doesn't fire scroll event :/
        // When non continous scrolling is ending, we force a refresh
        if (!continuous) {
          clearTimeout(this.refreshTimout as NodeJS.Timeout)
          this.refreshTimout = setTimeout(this.handleScroll, 100)
        }
      })
    }
  }

  handleVisibilityChange (isVisible: boolean, entry: ObjectType) {
    if (this.ready) {
      if (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0) {
        requestAnimationFrame(() => {
          this.updateVisibleItems(false)
        })
      }
    }
  }

  updateVisibleItems (checkItem: boolean, checkPositionDiff: boolean = false) {
    const itemSize = this.itemSize
    const minItemSize = this.computedMinItemSize
    const keyField = this.simpleArray ? null : this.keyField
    const items = this.items
    const count = items.length
    const sizes = this.sizes
    const views = this.views
    const unusedViews = this.unusedViews
    const pool = this.pool
    let startIndex, endIndex
    let totalSize

    if (!count) {
      startIndex = endIndex = totalSize = 0
    } else if (this.prerender) {
      startIndex = 0
      endIndex = this.prerender
      totalSize = null
    } else {
      const scroll = this.getScroll()

      // Skip update if use hasn't scrolled enough
      if (checkPositionDiff) {
        let positionDiff = scroll.start - this.lastUpdateScrollPosition
        if (positionDiff < 0) positionDiff = -positionDiff
        if ((itemSize === null && positionDiff < minItemSize) || positionDiff < itemSize) {
          return {
            continuous: true
          }
        }
      }
      this.lastUpdateScrollPosition = scroll.start

      const buffer = count * itemSize
      scroll.start -= buffer
      scroll.end += buffer

      // Variable size mode
      if (itemSize === null) {
        let h
        let a = 0
        let b = count - 1
        let i = ~~(count / 2)
        let oldI

        // Searching for startIndex
        do {
          oldI = i
          h = sizes[i].accumulator
          if (h < scroll.start) {
            a = i
          } else if (i < count - 1 && sizes[i + 1].accumulator > scroll.start) {
            b = i
          }
          i = ~~((a + b) / 2)
        } while (i !== oldI)
        i < 0 && (i = 0)
        startIndex = i

        // For container style
        totalSize = sizes[count - 1].accumulator

        // Searching for endIndex
        for (endIndex = i; endIndex < count && sizes[endIndex].accumulator < scroll.end; endIndex++);
        if (endIndex === -1) {
          endIndex = items.length - 1
        } else {
          endIndex++
          // Bounds
          endIndex > count && (endIndex = count)
        }
      } else {
        // Fixed size mode
        startIndex = ~~(scroll.start / itemSize)
        endIndex = Math.ceil(scroll.end / itemSize)

        // Bounds
        startIndex < 0 && (startIndex = 0)
        endIndex > count && (endIndex = count)

        totalSize = count * itemSize
      }
    }

    if (endIndex - startIndex > 1000) {
      this.itemsLimitError()
    }

    this.totalSize = totalSize

    let view = null as any

    const continuous = startIndex <= this.endIndex && endIndex >= this.startIndex

    if (this.continuous !== continuous) {
      if (continuous) {
        views.clear()
        unusedViews.clear()
        for (let i = 0, l = pool.length; i < l; i++) {
          view = pool[i]
          this.unuseView(view)
        }
      }
      this.continuous = continuous
    } else if (continuous) {
      for (let i = 0, l = pool.length; i < l; i++) {
        view = pool[i]
        if (view.nr.used) {
          // Update view item index
          if (checkItem) {
            view.nr.index = items.findIndex((item: any) => (keyField ? item[keyField] === view.item[keyField] : item === view.item))
          }

          // Check if index is still in visible range
          if (view.nr.index === -1 || view.nr.index < startIndex || view.nr.index >= endIndex) {
            this.unuseView(view)
          }
        }
      }
    }

    const unusedIndex = continuous ? null : (new Map() as Map<any, any>)

    let item: any, type, unusedPool
    let v
    for (let i = startIndex; i < endIndex; i++) {
      item = items[i]
      const key = keyField ? item[keyField] : item
      if (key == null) {
        throw new Error(`Key is ${key} on item (keyField is '${keyField}')`)
      }
      view = views.get(key)

      if (!itemSize && !sizes[i].size) {
        if (view) this.unuseView(view)
        continue
      }

      // No view assigned to item
      if (!view) {
        type = item.type
        unusedPool = unusedViews.get(type)

        if (continuous) {
          // Reuse existing view
          if (unusedPool && unusedPool.length) {
            view = unusedPool.pop()
            view.item = item
            view.nr.used = true
            view.nr.index = i
            view.nr.key = key
            view.nr.type = type
          } else {
            view = this.addView(pool, i, item, key, type)
          }
        } else {
          // Use existing view
          // We don't care if they are already used
          // because we are not in continous scrolling
          v = unusedIndex?.get(type) || 0

          if (!unusedPool || v >= unusedPool.length) {
            view = this.addView(pool, i, item, key, type)
            this.unuseView(view, true)
            unusedPool = unusedViews.get(type)
          }

          view = unusedPool[v]
          view.item = item
          view.nr.used = true
          view.nr.index = i
          view.nr.key = key
          view.nr.type = type
          unusedIndex?.set(type, v + 1)
          v++
        }
        views.set(key, view)
      } else {
        view.nr.used = true
        view.item = item
      }

      // Update position
      if (itemSize === null) {
        view.position = sizes[i - 1].accumulator
      } else {
        view.position = i * itemSize
      }
    }

    this.startIndex = startIndex
    this.endIndex = endIndex

    // After the user has finished scrolling
    // Sort views so text selection is correct
    clearTimeout(this.sortTimer as NodeJS.Timeout)
    this.sortTimer = setTimeout(this.sortViews, 300)

    return {
      continuous
    }
  }

  getListenerTarget () {
    let target = ScrollParent(this.$el)
    // Fix global scroll target for Chrome and Safari
    if (window.document && (target === window.document.documentElement || target === window.document.body)) {
      target = window
    }
    return target
  }

  getScroll () {
    const { $el: el, direction } = this
    const isVertical = direction === 'vertical'
    let scrollState

    if (this.pageMode) {
      const bounds = el.getBoundingClientRect()
      const boundsSize = isVertical ? bounds.height : bounds.width
      let start = -(isVertical ? bounds.top : bounds.left)
      let size = isVertical ? window.innerHeight : window.innerWidth
      if (start < 0) {
        size += start
        start = 0
      }
      if (start + size > boundsSize) {
        size = boundsSize - start
      }
      scrollState = {
        start,
        end: start + size
      }
    } else if (isVertical) {
      scrollState = {
        start: el.scrollTop,
        end: el.scrollTop + el.clientHeight
      }
    } else {
      scrollState = {
        start: el.scrollLeft,
        end: el.scrollLeft + el.clientWidth
      }
    }

    return scrollState
  }

  applyPageMode () {
    if (this.pageMode) {
      this.addListeners()
    } else {
      this.removeListeners()
    }
  }

  addListeners () {
    let supportsPassive = false

    if (typeof window !== 'undefined') {
      supportsPassive = false
      try {
        const opts = Object.defineProperty({}, 'passive', {
          get () {
            supportsPassive = true
          }
        })

        ;(window as any).addEventListener('test', null, opts)
      } catch (e) {}
    }

    this.listenerTarget = this.getListenerTarget()
    this.listenerTarget?.addEventListener(
      'scroll',
      this.handleScroll,
      supportsPassive
        ? {
            passive: true
          }
        : false
    )
    this.listenerTarget?.addEventListener('resize', this.handleResize)
  }

  removeListeners () {
    if (!this.listenerTarget) {
      return
    }

    this.listenerTarget.removeEventListener('scroll', this.handleScroll)
    this.listenerTarget.removeEventListener('resize', this.handleResize)

    this.listenerTarget = null
  }

  scrollToItem (index: number) {
    let scroll
    if (this.itemSize === null) {
      scroll = index > 0 ? this.sizes[index - 1].accumulator : 0
    } else {
      scroll = index * this.itemSize
    }
    this.scrollToPosition(scroll)
  }

  scrollToPosition (position: any) {
    if (this.direction === 'vertical') {
      this.$el.scrollTop = position
    } else {
      this.$el.scrollLeft = position
    }
  }

  itemsLimitError () {
    setTimeout(() => {
      console.log("It seems the scroller element isn't scrolling, so it tries to render all the items at once.", 'Scroller:', this.$el)
      console.log("Make sure the scroller has a fixed height (or width) and 'overflow-y' (or 'overflow-x') set to 'auto' so it can scroll correctly and only render the items visible in the scroll viewport.")
    })
    throw new Error('Rendered items limit reached')
  }

  sortViews () {
    this.pool.sort((viewA: ObjectType, viewB: ObjectType) => viewA.nr.index - viewB.nr.index)
  }
}
</script>

<style scoped>
.vue-recycle-scroller {
  position: relative;
}

.vue-recycle-scroller.direction-vertical:not(.page-mode) {
  overflow-y: auto;
}

.vue-recycle-scroller.direction-horizontal:not(.page-mode) {
  overflow-x: auto;
}

.vue-recycle-scroller.direction-horizontal {
  display: flex;
}

.vue-recycle-scroller__item-wrapper {
  flex: 1;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.vue-recycle-scroller.ready .vue-recycle-scroller__item-view {
  position: absolute;
  top: 0;
  left: 0;
}

.vue-recycle-scroller.direction-vertical .vue-recycle-scroller__item-wrapper {
  width: 100%;
}

.vue-recycle-scroller.direction-horizontal .vue-recycle-scroller__item-wrapper {
  height: 100%;
}

.vue-recycle-scroller.ready.direction-vertical .vue-recycle-scroller__item-view {
  width: 100%;
}

.vue-recycle-scroller.ready.direction-horizontal .vue-recycle-scroller__item-view {
  height: 100%;
}
</style>
