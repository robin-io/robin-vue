<template>
  <div class="robin-shim robin-flex-justify-end">
    <div class="robin-inner robin-h-100 robin-flex robin-slideInRight" ref="popup-body">
      <div class="robin-wrapper robin-mt-20 robin-mr-16" v-show="screenWidth > 1024">
        <IconButton name="close" @close="$emit('close')" emit="close" :to-emit="true" :to-click-away="false" />
        <!-- <RCloseButton @close="$emit('close')" /> -->
      </div>
      <div class="robin-modal-container robin-flex robin-flex-column" ref="popup-1">
        <IconButton name="close" @close="$emit('close')" emit="close" v-show="screenWidth <= 1024" class="robin-mb-17" :to-emit="true" :to-click-away="false" />
        <!-- <RCloseButton @close="$emit('close')" v-show="screenWidth <= 1024" class="robin-mb-17" /> -->
        <div class="robin-wrapper robin-slideIn">
          <RText color="#566BA0" :fontSize="20" as="h1" fontWeight="500">Chat Info</RText>
          <div class="robin-profile">
            <RAvatar class="robin-mb-15" />
            <RText color="#566BA0" fontWeight="400" :fontSize="15" as="h3" class="robin-mb-3 robin-mt-15">Jacob Jones</RText>
            <RText color="#BBC1D6" :fontSize="14" as="p">daniels_kunle78@hotmail.com</RText>
            <hr />
            <RText color="#BBC1D6" :fontSize="14" as="p">Some very long text here to test how far this bubble can go.</RText>
          </div>
          <!-- personal -->
          <RText color="#1F222D" :fontSize="14" as="p" class="robin-mb-13">Files</RText>
          <div class="robin-files">
            <div class="robin-upload robin-flex robin-flex-align-center">
              <!-- <img :src="images[getFileDetails(message.content.attachment).extension]" /> -->
              <img src="@/assets/default.png" />
              <div class="details robin-flex robin-flex-column robin-h-100 robin-flex-align-center">
                <RText as="span" :fontSize="14"> default.pdf </RText>
                <RText as="span" color="#7A7A7A" :fontSize="14"> 123kb </RText>
              </div>
              <IconButton name="download" class="robin-ml-auto" color="#15AE73" :to-emit="false" :to-click-away="false" />
              <!-- <RDownloadButton class="robin-ml-auto" /> -->
            </div>
          </div>
          <RText color="#1F222D" :fontSize="14" as="p" class="robin-mb-13">Media</RText>
          <div class="robin-media"></div>
          <!-- group -->
          <!-- <ul class="robin-nav robin-flex">
          <li class="active">Files</li>
          <li>Media</li>
        </ul> -->
          <RButton :fontSize="14" color="#ea8d51">Load More</RButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import RText from '@/components/ChatList/RText/RText.vue'
import RAvatar from '@/components/ChatList/RAvatar/RAvatar.vue'
// import RDownloadButton from '../RDownloadButton/RDownloadButton.vue'
import IconButton from '../../IconButton.vue'
// import RCloseButton from '@/components/ChatList/RCloseButton/RCloseButton.vue'
import RButton from '@/components/ChatList/RButton/RButton.vue'

// file-extension-images
import pdf from '@/assets/pdf.png'
import doc from '@/assets/doc.png'
import docx from '@/assets/docx.png'
import csv from '@/assets/csv.png'
import ppt from '@/assets/ppt.png'
import rtf from '@/assets/rtf.png'
import rar from '@/assets/rar.png'
import tar from '@/assets/tar.png'
import xls from '@/assets/xls.png'
import xlsx from '@/assets/xlsx.png'
import txt from '@/assets/txt.png'
import odt from '@/assets/odt.png'
import md from '@/assets/md.png'
import zipSeven from '@/assets/7z.png'
import zip from '@/assets/zip.png'
import html from '@/assets/html.png'

// eslint-disable-next-line
@Component<ViewMessageProfile>({
  name: 'ViewMessageProfile',
  components: {
    IconButton,
    // RCloseButton,
    RButton,
    RText,
    RAvatar
    // RDownloadButton
  }
})
export default class ViewMessageProfile extends Vue {
  screenWidth = 0 as number

  images = {
    pdf: pdf,
    doc: doc,
    docx: docx,
    csv: csv,
    ppt: ppt,
    rtf: rtf,
    rar: rar,
    tar: tar,
    xls: xls,
    xlsx: xlsx,
    txt: txt,
    odt: odt,
    md: md,
    '7z': zipSeven,
    zip: zip,
    html: html
  } as any

  mounted () {
    this.$nextTick(function () {
      this.onResize()
    })
    window.addEventListener('resize', this.onResize)
  }

  onResize () {
    this.screenWidth = window.innerWidth
  }
}
</script>

<style scoped>
.robin-shim {
  width: 100vw;
  height: 100vh;
  background-color: rgba(107, 116, 145, 0.1);
  backdrop-filter: blur(3.8731px);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  overflow-y: auto;
}

.robin-modal-container {
  width: 520px;
  height: 100%;
  padding: 2.5rem clamp(3%, 5vw, 3.625rem) 4.25rem clamp(3%, 5vw, 3.5rem);
  background-color: #fff;
}

.robin-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 2.375rem clamp(3%, 5vw, 0.875rem) 4.5rem clamp(3%, 5vw, 1rem);
  background-color: #f3f7ff;
  margin: 2.125rem 0px 2.25rem;
}

.robin-profile >>> h3,
.robin-profile >>> p {
  display: block;
  max-width: 229px !important;
  white-space: pre-wrap !important;
  text-align: center;
}

hr {
  width: 100%;
  margin: 1.313rem 0px 0.938rem;
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.robin-files {
  display: grid;
  grid-template-columns: repeat(2, 50%);
  gap: 0.5rem;
}

.robin-upload {
  border: 1px solid #ecebeb;
  border-radius: 12px;
  padding: 0.5rem;
  margin-bottom: 1.813rem;
}

.robin-upload .details {
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.1rem 0px;
  margin-left: 1.063rem;
}

.robin-media {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(72px, 72px));
  gap: 0.625rem 0.875rem;
}

.robin-media + .robin-button {
  text-align: center;
  letter-spacing: 0.02em;
  margin: 1.188rem auto 0px;
  display: block;
}

.robin-nav {
  list-style: none;
}

.robin-nav li {
  width: 100%;
  text-align: center;
  border-bottom: 1px solid #ecebeb;
  padding-bottom: 0.825rem;
  cursor: pointer;
}

.robin-nav li:hover {
  border-bottom: 1px solid var(--primary-color);
}

.robin-nav li.active {
  cursor: default;
  border-bottom: 1px solid var(--primary-color);
}

@media (min-width: 768px) {
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-track {
    /* border: 1px solid #00000017; */
    border-radius: 24px;
  }

  ::-webkit-scrollbar-thumb {
    width: 2px;
    background-color: #d6d6d6;
    border-radius: 24px;
    -webkit-border-radius: 24px;
    -moz-border-radius: 24px;
    -ms-border-radius: 24px;
    -o-border-radius: 24px;
  }
}

@media (max-width: 768px) {
  .robin-inner, .robin-modal-container {
    width: 100%;
  }
}
</style>
