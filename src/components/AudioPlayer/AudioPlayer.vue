<script lang="tsx">
import {
  defineComponent,
  ref,
  onMounted,
  computed,
  CSSProperties
} from 'vue-demi';
import store from '@/store/index';
import Content from '../Content/Content.vue';
import './Audio.css';

export default defineComponent({
  name: 'AudioPlayer',
  props: {
    message: {
      type: Object,
      default: () => {}
    },
    index: {
      type: [Number, String],
      default: 0
    }
  },
  setup(props) {
    const currentAudioPlaying = computed(() => {
      return store.state.currentAudioPlaying;
    });

    onMounted(() => {
      player.value = document.getElementById(`audio-${props.index}`) as any;

      player.value?.addEventListener('ended', () => {
        isPlaying.value = false;
      });

      player.value?.addEventListener('loadeddata', () => {
        resetProgress();
        duration.value = convertTimeMMSS(player.value?.duration as number);
        updateProgressTime();
      });

      player.value?.addEventListener('timeupdate', onTimeUpdate);
    });

    const convertTimeMMSS = (seconds: number) => {
      return new Date(seconds * 1000).toISOString().substr(14, 5);
    };

    const playback = () => {
      if (isPlaying.value) {
        player.value!.muted = true;
        player.value?.pause();
      } else {
        setTimeout(() => {
          player.value!.muted = false;
          player.value?.play();

          pauseOtherAudio();
          store.setState('currentAudioPlaying', props.index);
        });
      }
      isPlaying.value = !isPlaying.value;
    };

    const resetProgress = () => {
      if (isPlaying.value) player.value?.pause();
      duration.value = convertTimeMMSS(0);
      playedTime.value = convertTimeMMSS(0);
      percentage.value = 0;
      isPlaying.value = false;
      updateProgressTime();
    };

    const onTimeUpdate = () => {
      playedTime.value = convertTimeMMSS(player.value!.currentTime);
      percentage.value =
        (player.value!.currentTime / player.value!.duration) * 100;
      updateProgressTime();
    };

    const onUpdateProgress = () => {
      if (pos.value)
        player.value!.currentTime = pos.value * player.value!.duration;
    };

    const updateProgressTime = () => {
      progressTime.value =
        percentage.value > 1 ? playedTime.value : duration.value;
    };

    const onMouseDown = (event: MouseEvent) => {
      isMouseDown.value = true;
      pos.value = calculateLineHeadPosition(event, progress.value);
      onUpdateProgress();
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseUp = (event: MouseEvent) => {
      isMouseDown.value = false;
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
      pos.value = calculateLineHeadPosition(event, progress.value);
      onUpdateProgress();
    };

    const onMouseMove = (event: MouseEvent) => {
      pos.value = calculateLineHeadPosition(event, progress.value);
      onUpdateProgress();
    };

    const calculateLineHeadPosition = (
      event: MouseEvent,
      element: HTMLElement
    ) => {
      const progressWidth = element.getBoundingClientRect().width;
      const leftPosition = element.getBoundingClientRect().left;
      let pos = (event.clientX - leftPosition) / progressWidth;
      pos = pos < 0 ? 0 : pos;
      pos = pos > 1 ? 1 : pos;
      return pos;
    };

    const pauseOtherAudio = () => {
      const audioElements = document.querySelectorAll('audio');

      audioElements.forEach((audio) => {
        if (player.value !== audio) {
          audio.muted = true;
          audio.pause();
        }
      });
    };

    const progress = ref();
    const isPlaying = ref(false);
    const isMouseDown = ref(false);
    const percentage = ref(0);
    const pos = ref(0);
    const duration = ref(convertTimeMMSS(0));
    const playedTime = ref(convertTimeMMSS(0));
    const player = ref(null as null | HTMLAudioElement);
    const progressTime = ref('- : -');
    const audioLineProgressStyles = computed((): CSSProperties => {
      return {
        width: `${
          percentage.value > 10 ? percentage.value - 7 : percentage.value
        }%`
      };
    });
    const audioLineDotStyles = computed((): CSSProperties => {
      return {
        left: `${
          percentage.value > 10 ? percentage.value - 7 : percentage.value
        }%`
      };
    });

    return {
      percentage,
      playedTime,
      duration,
      audioLineProgressStyles,
      audioLineDotStyles,
      playback,
      onMouseDown
    };
  },
  render() {
    return (
      <div class="robin-audio robin-flex robin-flex-align-start">
        {!this.isPlaying ? (
          <i
            class="robin-material-icon"
            role="button"
            v-if="!isPlaying"
            onClick={() => this.playback()}
          >
            play_arrow
          </i>
        ) : (
          <i
            class="robin-material-icon"
            role="button"
            v-else
            onClick={() => this.playback()}
          >
            pause
          </i>
        )}

        <div class="robin-audio-bar-wrapper robin-flex robin-flex-column robin-flex-space-between">
          <div
            ref="progress"
            class="robin-audio-bar"
            onMouseDown={(event: MouseEvent) => this.onMouseDown(event)}
          >
            <div class="robin-audio-progress">
              <div class="robin-audio-line-container">
                <div
                  class="robin-audio-line-progress"
                  style={this.audioLineProgressStyles}
                />
                <div
                  role="progress-dot"
                  class={
                    this.isMouseDown
                      ? 'robin-audio-line-dot active'
                      : 'robin-audio-line-dot'
                  }
                  style={this.audioLineDotStyles}
                />
              </div>
            </div>
          </div>
          <span class="robin-audio-time">
            {this.percentage > 1 ? this.playedTime : this.duration}
          </span>
        </div>

        <audio
          data-testid={`audio-${this.index}`}
          id={`audio-${this.index}`}
          src={this.message.content.attachment}
        >
          Your browser does not support the
        </audio>
      </div>
    );
  }
});
</script>
