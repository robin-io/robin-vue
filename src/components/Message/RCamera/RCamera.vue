<template>
  <div class="robin-camera-box robin-squeezeOut" ref="popup-body">
    <header class="robin-head">
        <div class="robin-wrapper robin-mr-12" @click="closeCamera()">
          <RRemoveButton />
        </div>
        <RText as="h3" :font-size="18"> Take photo </RText>
    </header>
    <div class="robin-body">
      <video v-show="!isPhotoTaken" ref="camera" width="100%" height="500px" autoplay></video>
    <RCameraButton @clicked="takePhoto()" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Component from 'vue-class-component'
import RRemoveButton from '../../ChatList/RRemoveButton/RRemoveButton.vue'
import RText from '@/components/ChatList/RText/RText.vue'
import RCameraButton from '../RCameraButton/RCameraButton.vue'

const ComponentProps = Vue.extend({
  props: {
    cameraOpened: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  }
})

// eslint-disable-next-line
@Component<RCamera>({
  name: 'RCamera',
  components: {
    RText,
    RRemoveButton,
    RCameraButton
  },
  watch: {
    cameraOpened: {
      handler (val) {
        console.log(val)
        if (val) {
          this.setupMedia()
        }
      }
    }
  }
})
export default class RCamera extends ComponentProps {
  camera = null as any
  deviceId = null as any
  devices = [] as Array<any>
  isPhotoTaken = false as boolean
  isShotPhoto = false as boolean

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
      const getUserMedia = navigatorExtended.getUserMedia || navigatorExtended.webkitGetUserMedia || navigatorExtended.mozGetUserMedia || navigatorExtended.msGetUserMedia || navigatorExtended.oGetUserMedia
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
      .catch((error) => {
        console.log(error)
      })
  }

  closeCamera () {
    const camera = this.$refs.camera as any
    const tracks = camera.srcObject.getTracks()

    tracks.forEach((track: { stop: () => void }) => {
      track.stop()
    })

    this.$emit('close')
  }

  takePhoto () {
    const capture = this.getCanvas().toDataURL('image/jpeg')
    this.convertBase64ToFile(capture).then((res) => {
      this.$emit('captured-image', {
        file: res,
        localUrl: capture
      })
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

  // handleCapture (): void {
  //   const img = this.$refs as any
  //   this.convertBase64ToFile(img.webcam.capture()).then((res) => {
  //     this.$emit('captured-image', {
  //       file: res,
  //       localUrl: img.webcam.capture()
  //     })
  //   })
  //   console.log(img.webcam.capture())
  //   this.closeCamera()
  // }

  // startCamera (): void {
  //   const camera = this.$refs.webcam as any
  //   if (camera) {
  //     camera.start()
  //   }
  // }

  // stopCamera (): void {
  //   const camera = this.$refs.webcam as any
  //   camera.stop()
  // }

  // handleCameras (cameras: Array<any>): void {
  //   this.devices = cameras
  // }

  // closeCamera (): void {
  //   this.stopCamera()
  //   this.$emit('close')
  // }
}
</script>

<style scoped>
.robin-camera-box {
  height: calc(100% - 6.3rem);
  position: absolute;
  /* top: 300px; */
  bottom: 0;
  width: 100%;
  /* border: 1px solid; */
  background-color: #fff;
  z-index: 2;
  display: flex;
  flex-direction: column;
  transform-origin: bottom;
}

.robin-head {
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 0 2.688rem 0 3.125rem;
  box-shadow: 0 0px 0px rgba(0, 104, 255, 0.07), 0px -1px 10px rgba(0, 104, 255, 0.07);
}

.robin-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0 2.688rem 1rem 3.125rem;
  overflow-y: auto;
}

video {
  margin: 2rem 0 1.5rem;
}
</style>
