<template>
  <div class="robin-camera-box robin-squeezeOut" ref="popup-body">
    <header class="robin-head">
      <div class="robin-wrapper robin-mr-12" @click="closeCamera()" data-testid="close-camera">
        <icon-button name="remove" :to-emit="false" :to-click-away="false" />
      </div>
      <content as="h3" :font-size="18"> Take photo </content>
    </header>
    <div class="robin-body">
      <video
        v-show="!isPhotoTaken"
        ref="camera"
        width="100%"
        :height="screenWidth > 480 ? '500px' : '250px'"
        autoplay="true"
        muted="true"
      ></video>
      <camera-button
        :camera-opened="cameraOpened"
        v-if="cameraOpened"
        @clicked="takePhoto()"
        data-testid="camera-button"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import IconButton from '@/components/IconButton/IconButton.vue'
import Content from '@/components/Content/Content.vue'
import CameraButton from '../CameraButton/CameraButton.vue'

const ComponentProps = Vue.extend({
  props: {
    cameraOpened: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  }
})

// eslint-disable-next-line
@Component<Camera>({
  name: 'Camera',
  components: {
    Content,
    IconButton,
    CameraButton
  },
  watch: {
    cameraOpened: {
      handler (val) {
        if (val) {
          this.setupMedia()
        }
      }
    }
  }
})
export default class Camera extends ComponentProps {
  camera = null as any
  deviceId = null as any
  devices = [] as Array<any>
  isPhotoTaken = false as boolean
  isShotPhoto = false as boolean
  screenWidth = 0 as number

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
  }

  setupMedia () {
    const navigatorExtended = navigator as any
    if (navigatorExtended.mediaDevices === undefined) {
      navigatorExtended.mediaDevices = {}
    }
    if (navigatorExtended.mediaDevices.getUserMedia === undefined) {
      navigatorExtended.mediaDevices.getUserMedia = this.legacyGetUserMediaSupport()
    }
    this.createCameraElement()
  }

  legacyGetUserMediaSupport () {
    const navigatorExtended = navigator as any

    return (constraints: MediaStreamConstraints) => {
      const getUserMedia =
        navigatorExtended.getUserMedia ||
        navigatorExtended.webkitGetUserMedia ||
        navigatorExtended.mozGetUserMedia ||
        navigatorExtended.msGetUserMedia ||
        navigatorExtended.oGetUserMedia
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
      }
      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject)
      })
    }
  }

  createCameraElement () {
    const camera = this.$refs.camera as any
    const windowEl = window as any

    const constraints = (windowEl.constraints = {
      audio: false,
      video: true
    })

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        camera.srcObject = stream
      })
      .catch()
  }

  closeCamera () {
    const camera = this.$refs.camera as any
    const tracks = camera.srcObject.getTracks()

    tracks.forEach((track: { stop: () => void }) => {
      track.stop()
    })

    this.$emit('close')
  }

  async takePhoto () {
    const capture = this.getCanvas().toDataURL('image/jpeg')

    const res = await this.convertBase64ToFile(capture)

    this.$emit('captured-image', {
      file: res,
      localUrl: capture
    })

    this.closeCamera()
  }

  getCanvas () {
    const camera = this.$refs.camera as any
    const canvas = document.createElement('canvas')
    canvas.height = camera.height
    canvas.width = 500

    const ctx = canvas.getContext('2d')

    ctx?.drawImage(camera, 0, 0, canvas.width, canvas.height)

    return canvas
  }

  createUuid (length: number) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }

  async convertBase64ToFile (base64: string): Promise<File> {
    const res: Response = await fetch(base64)
    const blob: Blob = await res.blob()
    return new File([blob], `${this.createUuid(30)}.jpeg`, { type: 'image/jpeg' })
  }

  onResize () {
    this.screenWidth = window.innerWidth
  }
}
</script>
