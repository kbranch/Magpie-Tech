import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/assets/main.css'

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");

export async function hashBytes(bytes) {
    const hashBuf = await crypto.subtle.digest('SHA-256', bytes);
    const hashBytes = new Uint8Array(hashBuf);
    return Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function download(content, mimeType, filename){
  const a = document.createElement('a')
  const blob = new Blob([content], {type: mimeType})
  const url = URL.createObjectURL(blob)

  a.setAttribute('href', url)
  a.setAttribute('download', filename)
  a.click()
}