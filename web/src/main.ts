import { createApp } from 'vue'
import App from './App.vue'

// Import Tailwind CSS - MUST be first
import './assets/main.css'
// Import enhanced styles
import './assets/styles.css'

const app = createApp(App)

app.mount('#app')

// Add smooth scrolling
document.documentElement.style.scrollBehavior = 'smooth'
