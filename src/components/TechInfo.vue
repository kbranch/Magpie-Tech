<script setup>

import 'md-editor-v3/lib/preview.css';
import 'md-editor-v3/lib/style.css';
import { MdPreview } from 'md-editor-v3';
import { computed, defineAsyncComponent, watch } from 'vue';
import { useRouter } from 'vue-router';

const MdEditor = defineAsyncComponent(() => import('md-editor-v3').then((module) => module.MdEditor));

const router = useRouter();
const tech = defineModel();
const props = defineProps(['activeSection', 'edit']);
const emit = defineEmits(['linkCopied']);

const toolbarExclude = [
    'pageFullscreen',
    'fullscreen',
    'mermaid',
    'katex',
    'revoke',
    'next',
    'save',
    'htmlPreview',
];

const activeIndex = computed(() => {
  let index = tech.value?.sections?.indexOf(tech.value.sections.find((x) => x.id === props.activeSection)) ?? 0;
  return Math.max(index, 0);
});

async function copyLink(section, event) {
  await navigator.clipboard.writeText(new URL(sectionPath(section), document.baseURI).href);
  emit('linkCopied', event.clientX, event.clientY);
}

function sectionPath(section) {
  return `/${tech.value.game}/${tech.value.id}/${section.id}`;
}

function defaultSection() {
  if (tech.value?.sections?.length && !props.activeSection) {
    router.push(sectionPath(tech.value?.sections[0]));
  }
}

function setListener(section, event) {
  let collapsable = document.querySelector(event.target.dataset.bsTarget);
  collapsable.addEventListener('shown.bs.collapse', () => router.push(sectionPath(section)));
}

watch(() => [props.activeSection, tech.value], defaultSection);

</script>

<template>


<template v-if="tech">
  <div v-if="edit" class="tech-form">
    <button type="button" class="btn btn-secondary" @click="tech.sections.push({id: 'new-section', title: 'New Section', body: ''})">
      Add Section
    </button>
  </div>

  <MdPreview v-if="!edit" v-model="tech.description" theme="dark" class="md-outer-editor" :no-mermaid="true" :no-katex="true" />
  <MdEditor v-else v-model="tech.description" theme="dark" language="en-US" :toolbars-exclude="toolbarExclude" class="md-outer-editor" :no-mermaid="true" :no-katex="true" />
</template>

<div class="accordion" id="sectionAccordion">
  <div v-for="(section, i) in tech?.sections" :key="section.title" class="accordion-item">
    <div v-if="edit" class="tech-form">
      <input v-model="section.id" type="text" class="form-control my-2">
      <input v-model="section.title" type="text" class="form-control my-2">
      <button type="button" class="btn btn-secondary" @click="tech.sections = tech.sections.filter(x => x.id != section.id)">
        Delete Section
      </button>
    </div>

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
        <MdPreview v-if="!edit" v-model="section.body" theme="dark" class="md-outer-editor" :no-mermaid="true" :no-katex="true" />
        <MdEditor v-else v-model="section.body" theme="dark" language="en-US" :toolbars-exclude="toolbarExclude" class="md-outer-editor" :no-mermaid="true" :no-katex="true" />
      </div>
    </div>
  </div>
</div>

</template>

<style scoped>

.tech-form {
  display: flex;
}

.form-control {
  margin-left: 8px;
  margin-right: 8px;
}

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