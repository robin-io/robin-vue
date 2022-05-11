<template>
  <div class="robin-ap robin-flex robin-flex-align-start">
    <i class="robin-material-icon" role="button" v-if="!isPlaying" @click="playback()">play_arrow</i>
    <i class="robin-material-icon" role="button" v-else @click="playback()">pause</i>
    <div class="robin-ap-bar-wrapper robin-flex robin-flex-column robin-flex-space-between">
      <div ref="progress" class="robin-ap-bar" @mousedown="onMouseDown">
        <div class="robin-ap-progress">
          <div class="robin-ap-line-container">
            <div class="robin-ap-line-progress" :style="{ width: `${percentage}%` }" />
            <div role="progress-dot" class="robin-ap-line-dot" :class="{ active: isMouseDown }" :style="{ left: `${percentage}%` }" />
          </div>
        </div>
      </div>
      <span class="robin-ap-time">
          time{{ percentage > 1 ? playedTime : duration }}
      </span>
    </div>
    <audio :data-testid="`audio-${index}`" :id="`audio-${index}`" :src="message.content.attachment">Your browser does not support the</audio>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Content from '@/components/Content/Content.vue'

const ComponentProps = Vue.extend({
  props: {
    message: {
      type: Object,
      default: () => {}
    },
    index: {
      type: [Number, String],
      default: 0
    }
  }
})

@Component({
  name: 'AudioPlayer',
  components: {
    Content
  }
})
export default class AudioPlayer extends ComponentProps {
  isPlaying = false as boolean
  isMouseDown = false as boolean
  percentage = 0 as number
  pos = 0 as number
  duration = this.convertTimeMMSS(0) as string
  playedTime = this.convertTimeMMSS(0) as string
  player = null as any
  progressTime = '- : -' as string

  mounted () {
    this.player = document.getElementById(`audio-${this.index}`) as any

    this.player.addEventListener('ended', () => {
      this.isPlaying = false
    })

    this.player.addEventListener('loadeddata', () => {
      this.resetProgress()
      this.duration = this.convertTimeMMSS(this.player.duration)
      this.updateProgressTime()
    })

    this.player.addEventListener('timeupdate', this.onTimeUpdate)
  }

  convertTimeMMSS (seconds: number) {
    return new Date(seconds * 1000).toISOString().substr(14, 5)
  }

  playback () {
    if (this.isPlaying) {
      this.player.muted = true
      this.player.pause()
    } else {
      setTimeout(() => {
        this.player.muted = false
        this.player.play()
      })
    }
    this.isPlaying = !this.isPlaying
  }

  resetProgress () {
    if (this.isPlaying) this.player.pause()
    this.duration = this.convertTimeMMSS(0)
    this.playedTime = this.convertTimeMMSS(0)
    this.percentage = 0
    this.isPlaying = false
    this.updateProgressTime()
  }

  onTimeUpdate () {
    this.playedTime = this.convertTimeMMSS(this.player.currentTime)
    this.percentage = (this.player.currentTime / this.player.duration) * 100
    this.updateProgressTime()
  }

  onUpdateProgress () {
    if (this.pos) this.player.currentTime = this.pos * this.player.duration
  }

  updateProgressTime () {
    this.progressTime = this.percentage > 1 ? this.playedTime : this.duration
  }

  onMouseDown (event: any) {
    this.isMouseDown = true
    this.pos = this.calculateLineHeadPosition(event, this.$refs.progress)
    this.onUpdateProgress()
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
  }

  onMouseUp (event: any) {
    this.isMouseDown = false
    document.removeEventListener('mouseup', this.onMouseUp)
    document.removeEventListener('mousemove', this.onMouseMove)
    this.pos = this.calculateLineHeadPosition(event, this.$refs.progress)
    this.onUpdateProgress()
  }

  onMouseMove (event: any) {
    this.pos = this.calculateLineHeadPosition(event, this.$refs.progress)
    this.onUpdateProgress()
  }

  calculateLineHeadPosition (event: any, element: any) {
    const progressWidth = element.getBoundingClientRect().width
    const leftPosition = element.getBoundingClientRect().left
    let pos = (event.clientX - leftPosition) / progressWidth
    pos = pos < 0 ? 0 : pos
    pos = pos > 1 ? 1 : pos
    return pos
  }
}
</script>

<style scoped>
i {
  color: #9999bc;
  font-size: 1.5rem;
  user-select: none;
  cursor: pointer;
}

.robin-ap-bar-wrapper {
  margin-right: 7px;
  max-width: calc(95% - 18px);
  position: relative;
  margin-left: 0.25rem;
}

.robin-ap-bar {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 6%;
}

.robin-ap-progress {
  width: 190px;
}

.robin-ap-line-container {
  position: relative;
  height: 2px;
  border-radius: 5px;
  background-color: #cccccc;
}

.robin-ap-line-progress {
  position: absolute;
  height: inherit;
  background-color: #9999bc;
  border-radius: inherit;
}

.robin-ap-line-dot {
  position: absolute;
  top: -5px;
  margin-left: -1px;
  height: 14px;
  width: 14px;
  border-radius: 50%;
  background-color: var(--primary-color);
  transition: transform 0.25s;
  cursor: grab;
}

.robin-ap-line-dot:active {
    cursor: grabbing;
}

.robin-ap-line-dot.active {
  transform: scale(1.2);
}

.robin-ap-time {
    font-size: 0.75rem;
    color: #51545C;
    position: absolute;
    top: 28px;
}

@media only screen and (max-width: 768px) {
  .robin-ap-bar {
    margin-right: 5px;
  }

  .robin-ap-line-dot {
    height: 12px;
    width: 12px;
    top: -5px;
    margin-left: -5px;
  }
}
</style>
