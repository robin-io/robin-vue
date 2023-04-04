<template>
  <div class="robin-ap robin-flex robin-flex-align-start">
    <i
      class="robin-material-icon robin-material-symbols-outlined robin-disabled"
      v-if="message.pseudo"
      >play_disabled</i
    >
    <i
      class="robin-material-icon"
      role="button"
      v-if="!isPlaying && !message.pseudo"
      @click="playback()"
      >play_arrow</i
    >
    <i
      class="robin-material-icon"
      role="button"
      v-if="isPlaying && !message.pseudo"
      @click="playback()"
      >pause</i
    >
    <div class="robin-ap-bar-wrapper robin-flex robin-flex-column robin-flex-space-between">
      <div ref="progress" class="robin-ap-bar" @mousedown="onMouseDown">
        <div class="robin-ap-progress">
          <div class="robin-ap-line-container">
            <div
              class="robin-ap-line-progress"
              :style="{ width: `${percentage > 10 ? percentage - 7 : percentage}%` }"
            />
            <div
              role="progress-dot"
              class="robin-ap-line-dot"
              :class="{ active: isMouseDown, 'robin-disabled': message.pseudo }"
              :style="{ left: `${percentage > 10 ? percentage - 7 : percentage}%` }"
            />
          </div>
        </div>
      </div>
      <span class="robin-ap-time">
        {{ percentage > 1 ? playedTime : duration }}
      </span>
    </div>
    <audio
      :data-testid="`audio-${index}`"
      :id="`audio-${index}`"
      :src="
        typeof message.content.attachment === 'string'
          ? message.content.attachment
          : convertFileToURL(convertArrayBufferToFile(message.content.attachment, message))
      "
      muted
    >
      Your browser does not support the
    </audio>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { convertFileToURL, convertArrayBufferToFile } from '@/utils/helpers'
import store from '@/store/index'

const ComponentProps = Vue.extend({
  props: {
    message: {
      type: Object,
      default: () => ({})
    },
    index: {
      type: [Number, String],
      default: 0
    }
  }
})

// eslint-disable-next-line
@Component<AudioPlayer>({
  name: 'AudioPlayer',
  watch: {
    currentAudioPlaying: {
      handler (playingIndex) {
        if (playingIndex !== this.index) {
          this.isPlaying = false
        }
      }
    }
  }
})
export default class AudioPlayer extends ComponentProps {
  isPlaying = false as boolean;
  isMouseDown = false as boolean;
  percentage = 0 as number;
  pos = 0 as number;
  duration = this.convertTimeMMSS(0) as string;
  playedTime = this.convertTimeMMSS(0) as string;
  player = null as any;
  progressTime = '- : -' as string;
  convertFileToURL = convertFileToURL;
  convertArrayBufferToFile = convertArrayBufferToFile;

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

  get currentAudioPlaying () {
    return store.state.currentAudioPlaying
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

        this.pauseOtherAudio()
        store.setState('currentAudioPlaying', this.index)
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
    if (!this.message.pseudo) {
      this.isMouseDown = true
      this.pos = this.calculateLineHeadPosition(event, this.$refs.progress)
      this.onUpdateProgress()
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    }
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

  pauseOtherAudio () {
    const audioElements = document.querySelectorAll('audio')

    audioElements.forEach((audio) => {
      if (this.player !== audio) {
        audio.muted = true
        audio.pause()
      }
    })
  }
}
</script>
