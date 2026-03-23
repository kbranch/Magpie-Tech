import { ref, watch } from "vue";
import { defineStore } from "pinia";

export const useRomStore = defineStore("rom", () => {
  const romData = ref(null);

  watch(romData, (newValue) => {
    if (!newValue.byteLength) {
      return;
    }

    localStorage.setItem('romData', arrayBufferToBase64(newValue));
  });

  try {
    romData.value = base64ToArrayBuffer(localStorage.getItem('romData')) || null;
    if (romData.value?.byteLength < 1000) {
      romData.value = null;
    }
  }
  catch {
    romData.value = null;
  }

  function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  }

  function base64ToArrayBuffer(base64) {
    let binary = atob(base64);
    let len = binary.length;
    let bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
  }

  return { romData };
});
