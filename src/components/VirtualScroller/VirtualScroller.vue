<template>
  <div class="robin-virtual-scroller" :style="{ overflow: 'auto' }" ref="scroller" @scroll="getScrollTop">
    <div
      class="viewport"
      :style="{
        overflow: 'hidden',
        willChange: 'transform',
        height: !maxContent ? totalHeight + 'px' : 'max-content',
        position: 'relative'
      }"
    >
      <div :style="{ willChange: 'transform', transform: `translateY(${offsetY}px)` }" class="wrapper">
        <slot v-for="(_, index) in visibleNodeCount" :index="index + startNode" :item="items[index + startNode]"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'

const ComponentProps = Vue.extend({
  props: {
    items: {
      type: Array as PropType<(string | ObjectType)[]>,
      default: () => ([])
    },
    itemCount: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    },
    maxContent: {
      type: Boolean,
      default: false
    },
    childHeight: {
      type: Array as PropType<Array<number>>,
      default: () => ([0])
    },
    renderAfter: {
      type: Number,
      default: 25
    }
  }
})

@Component({
  name: 'VirtualScroller'
})
export default class VirtualScroller extends ComponentProps {
  scrollTop = 0
  animationFrame = null as null | number

  mounted () {
    const wrapper = (this.$refs.scroller as HTMLElement)
    this.scrollTop = wrapper ? wrapper.scrollTop : 0
  }

  get childPositions () {
    const results = [0]

    for (let i = 1; i < this.itemCount; i++) {
      results.push(results[i - 1] + this.childHeight[i - 1])
    }

    return results
  }

  get totalHeight () {
    return this.childPositions[this.itemCount - 1] + this.childHeight[this.itemCount - 1]
  }

  get firstVisibleNode () {
    return this.getStartNode()
  }

  get lastVisibleNode () {
    return this.getEndNode()
  }

  get startNode () {
    const nodes = this.firstVisibleNode - this.renderAfter
    return Math.max(0, nodes)
  }

  get endNode () {
    return Math.min(this.itemCount - 1, this.lastVisibleNode + this.renderAfter)
  }

  get visibleNodeCount () {
    return Math.max(0, this.endNode - this.startNode + 1)
  }

  get offsetY () {
    return this.childPositions[this.startNode]
  }

  getStartNode () {
    let startRange = 0
    let endRange = Math.max(0, this.itemCount - 1)

    while (startRange !== endRange) {
      const middle = Math.floor((endRange - startRange) / 2 + startRange)

      if (this.childPositions[middle] <= this.scrollTop && this.childPositions[middle + 1] > this.scrollTop) {
        return middle
      }

      if (middle === startRange) {
        return endRange
      } else {
        if (this.childPositions[middle] <= this.scrollTop) {
          startRange = middle
        } else {
          endRange = middle
        }
      }
    }

    return this.itemCount
  }

  getEndNode () {
    let endNode = 0

    for (endNode = this.startNode; endNode < this.itemCount; endNode++) {
      if (this.childPositions[endNode] > this.childPositions[this.startNode + 1] + this.height) {
        return endNode
      }
    }

    return endNode
  }

  getScrollTop (event: ObjectType) {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame)

    this.animationFrame = requestAnimationFrame(() => {
      this.scrollTop = event.target.scrollTop
    })

    this.$emit('scroll')
  }
}
</script>
