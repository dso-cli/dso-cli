import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Icon from './components/Icon.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('Icon', Icon)
  }
}

