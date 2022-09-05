<script lang="tsx">
import { defineComponent } from 'vue-demi';
import Content from '../Content/Content.vue';
import assets from '@/asset-url.json';
import '../PageLoader.css';

export default defineComponent({
  name: 'PageLoader',
  components: {
    Content,
  },
  render() {
    return (
      <div class="robin-page-loader robin-shim">
        <div class="robin-inner-shim">
          <div class="robin-loader-ctn">
            <div class="robin-loader"></div>
            <img class="robin-pulse-1" src={assets['robin_icon']} alt="logo" />
          </div>
          <div class="robin-come-up robin-mt-18">
            <Content as="h2" color="#fff" font-weight="'bold'" font-size={24}>
              {() => 'Getting messages...'}
            </Content>
          </div>
        </div>
      </div>
    );
  },
});
</script>
