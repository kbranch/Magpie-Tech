<script setup>

import 'md-editor-v3/lib/preview.css';
import { MdPreview } from 'md-editor-v3';
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps(['description', 'sections', 'activeSection', 'techId']);
const emit = defineEmits(['linkCopied']);

const markdownWrapper = computed(() => {
  return props.description;
});

const activeIndex = computed(() => {
  let index = props.sections?.indexOf(props.sections.find((x) => x.id === props.activeSection)) ?? 0;
  return Math.max(index, 0);
});

async function copyLink(section, event) {
  await navigator.clipboard.writeText(new URL(sectionPath(section), document.baseURI).href);
  emit('linkCopied', event.clientX, event.clientY);
}

function sectionPath(section) {
  return `/${props.techId}/${section.id}`;
}

function defaultSection() {
  if (props.sections?.length && !props.activeSection) {
    router.push(sectionPath(props.sections[0]));
  }
}

function setListener(section, event) {
  let collapsable = document.querySelector(event.target.dataset.bsTarget);
  collapsable.addEventListener('shown.bs.collapse', () => router.push(sectionPath(section)));
}

watch(() => [props.activeSection, props.sections], defaultSection);

</script>

<template>

<MdPreview v-model="markdownWrapper" theme="dark" class="md-outer-editor" :no-mermaid="true" :no-katex="true" />

<div class="accordion" id="sectionAccordion">
  <div v-for="(section, i) in sections" :key="section.title" class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button" :class="{'collapsed': i != activeIndex}" type="button" data-bs-toggle="collapse"
        :data-bs-target="`#collapse${i}`" :aria-expanded="i == activeIndex ? 'true' : 'false'"
        :aria-controls="`#collapse${i}`" @click="setListener(section, $event)">
        {{ section.title }}
      </button>
      <img @click="copyLink(section, $event)" ref="linkElements" src="/images/link.svg" class="copy-link">
    </h2>
    <div :id="`collapse${i}`" class="accordion-collapse collapse" :class="{'show': i == activeIndex}" data-bs-parent="#sectionAccordion">
      <div class="accordion-body">
        <MdPreview v-model="section.body" theme="dark" class="md-outer-editor" :no-mermaid="true" :no-katex="true" />
      </div>
    </div>
  </div>
</div>

</template>

<style scoped>

.accordion-header {
  position: relative;
  display: flex;
  align-items: center;
}

.accordion-button {
  margin-right: 48px;
}

.copy-link {
  position: absolute;
  right: 0px;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 52px;
  padding: 12px;
  cursor: pointer;
  border-color: var(--color-border-hover);
  border-width: 1px;
  border-left-style: solid;
  border-bottom-style: solid;
}

.copy-link:hover {
  background-color: var(--color-background-mute);
}

</style>

<style>

svg.md-editor-icon {
  height: 24px;
  width: 24px;
}

.md-outer-editor {
  --md-bk-color: var(--color-background-soft);
  border-radius: 5px;
  padding: 8px;
}

.md-editor-resize-operate {
  background-color: var(--md-color) !important;
}

.md-editor-preview {
  word-break: keep-all;
}

.cm-editor {
  background-color: rgba(0, 0, 0, 0);
}
</style>