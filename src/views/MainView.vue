<script setup>
import { RomPatcher } from '@/rom-patcher-js/RomPatcher.js';
import { BinFile } from '@/rom-patcher-js/modules/BinFile.js';
import { hashBytes, sortByKey } from '@/main.js';
import { computed, onMounted, ref, watch } from 'vue';
import TechInfo from '@/components/TechInfo.vue';
import { useRomStore } from '@/stores/romStore';
import { Toast } from 'bootstrap';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps(['techId', 'sectionId', 'game']);

const patchBase = '/patches/';
const ladxHash = 'c95dd3d9cb798e86c28e3269554e458d434bf3277b96cadf5bc81cfacfb5ee60'
const allowEdit = import.meta.env.VITE_ALLOW_EDIT === 'true';

const romStore = useRomStore();
const techs = ref(null);
const activeTech = computed(() => techs.value?.find(x => x.id === props.techId));
const toastElement = ref(null);
const toast = ref(null);
const toastX = ref(0);
const toastY = ref(0);
const toastXBind = computed(() => `${toastX.value}px`);
const toastYBind = computed(() => `${toastY.value}px`);

const romInput = ref(null);

function buildPatchPath(patch) {
  return patchBase + patch;
}

function patchAndDownload(patchBuffer) {
  let patchPath = buildPatchPath(activeTech.value.patch);
  console.log(patchPath);
  let romBin = new BinFile(romStore.romData);
  let patchBin = new BinFile(patchBuffer);
  let patch = RomPatcher.parsePatchFile(patchBin);
  let patchedRom = RomPatcher.applyPatch(romBin, patch);

  console.log(patchedRom);
  patchedRom.fileName = activeTech.value.patch.replace('.ips', '.gbc');
  patchedRom.save();
}

function fetchPatchFileAndPatch() {
  let patchPath = buildPatchPath(activeTech.value.patch);
  fetch(patchPath)
    .then(response => {
      return response.arrayBuffer();
    })
    .then(patchBuffer => {
      patchAndDownload(patchBuffer);
    });
}

async function loadRom() {
  if (romInput.value.files.length == 0) {
    return;
  }

  let romFile = romInput.value.files[0];

  let buffer = await romFile.arrayBuffer();
  let bytes = new Uint8Array(buffer);

  let hash = await hashBytes(bytes);

  if (hash !== ladxHash) {
    alert('Invalid ROM file. Please select a LADX English 1.0 ROM.');
    return;
  }

  romStore.romData = buffer;
}

function linkCopied(x, y) {
  toastX.value = x;
  toastY.value = y;
  toast.value.show();
}

function pushPath(newTechId) {
  let targetGame = props.game ?? 'ladx';
  let targetTechId = newTechId ?? props.techId;

  if (techs.value?.length && !targetTechId) {
    targetTechId = techs.value[0].id;
  }

  let path = `/${targetGame}`;

  if (targetTechId) {
    path += `/${targetTechId}`;
  }

  if (props.sectionId && (!newTechId || newTechId === props.techId)) {
    path += `/${props.sectionId}`;
  }

  router.push(path);
}

watch(() => activeTech.value?.id, (newValue) => {
  pushPath(newValue);
});

onMounted(() => {
  pushPath();

  toast.value = new Toast(toastElement.value);

  fetch('/tech.json')
    .then(response => response.json())
    .then(data => {
      techs.value = sortByKey(data, x => x.title);
      pushPath();
    });
});

</script>

<template>

  <div ref="toastElement" class="toast align-items-center" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="1000">
    <div class="d-flex">
      <div class="toast-body">
        Link copied
      </div>
    </div>
  </div>

  <h1 class="mb-4">LADX Tech</h1>

  <div class="row pb-3">
    <div class="col-auto">
      <span v-if="romStore.romData" class="file-label">LADX English 1.0 ROM loaded</span>
      <span v-else class="file-label">Select LADX English 1.0 ROM</span>
      <input type="file" accept=".gbc" class="hidden" id="romInput" ref="romInput" @change="loadRom()" />
      <input type="button" id="romButton" class="btn btn-secondary" value="Browse..."
        onclick="document.getElementById('romInput').click();" />
    </div>
    <div v-if="activeTech?.patch" class="col d-flex justify-content-end">
      <button class="btn btn-secondary" @click="fetchPatchFileAndPatch()" :disabled="!romStore.romData" :title="romStore.romData ? '' : 'No vanilla LADX ROM loaded'">Download {{ activeTech.title }} Practice ROM</button>
    </div>
  </div>

  <div v-if="techs" class="row">
    <div class="col-3">
      <p v-for="tech in techs?.filter(x => x.game == game)" :key="tech.title" @click="pushPath(tech.id)" class="tech-title"
        :class="{ 'active': activeTech === tech }">
        {{ tech.title }}
      </p>

      <p class="pt-4">Have questions? Join us on <a href="https://discord.gg/QhAKagk84e">Discord</a>, we're happy to help!</p>
      <p class="pt-2">We also two weekly races, one async and one sync 👀</p>
      <p class="pt-4">Interested in making content like this for other games? Contact kbranch on Discord, the site is set up to handle that</p>
    </div>

    <div class="col">
      <div v-if="activeTech && allowEdit" class="tech-form">
        <input v-model="activeTech.id" type="text" class="form-control my-2">
        <input v-model="activeTech.title" type="text" class="form-control my-2">
        <input v-model="activeTech.patch" type="text" class="form-control my-2">
        <button type="button" class="btn btn-secondary" @click="techs.push({id: 'new-tech', title: 'New Tech', game: 'ladx', sections: []})">
          Add Tech
        </button>
      </div>
      <TechInfo v-model="activeTech" :active-section="sectionId" :edit="allowEdit" @link-copied="linkCopied" />
    </div>
  </div>

  <button v-if="allowEdit" type="button" class="btn btn-secondary mt-2" @click="console.log(techs)">Output JSON</button>

</template>

<style>
.icon-button {
  height: 32px;
  width: 32px;
  padding: 6px;
  margin-left: 6px;
  margin-right: 6px;
  filter: invert(1) brightness(0.5);
  cursor: pointer;
}

.icon-button:hover {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.dimvert {
  filter: invert(1) brightness(0.5);
}

.hidden {
  display: none;
}
</style>

<style scoped>

.tech-form {
  display: flex;
}

.form-control {
  margin-left: 8px;
  margin-right: 8px;
}

.toast {
  position: absolute;
  top: v-bind(toastYBind);
  left: v-bind(toastXBind);
  transform: translateX(-105%)translateY(-105%);
  z-index: 999;
  width: auto;
  font-size: 16px;
}

.file-label {
  margin-right: 16px;
  align-content: center;
}

.search-icon {
  height: 22px;
  filter: invert(1) brightness(0.5);
}

.tab-header {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  max-width: 200px;
  min-width: 75px;
  flex-shrink: 1;
  background-color: #ffffff0d;
  border-color: #00000080;
  color: unset;
  width: 100%;
}

.search-box:focus {
  background-color: #ffffff10;
  color: unset;
}

.nav-link {
  color: unset;
}

.tech-title:not(.active):hover {
  background-color: var(--color-background-soft);
}

.tech-title.active:hover {
  background-color: var(--color-background-mute);
}

.tech-title.active {
  background-color: var(--color-background-soft);
}

.tech-title {
  cursor: pointer;
  padding: 8px;
  margin-top: 4px;
  margin-bottom: 4px;
  border-radius: 5px;
  justify-content: center;
  display: flex;
}

.d-flex {
  flex-wrap: wrap;
}
</style>

<style scoped>
.btn {
  pointer-events: auto;
}
</style>