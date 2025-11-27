import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'DSO - DevSecOps Oracle',
  description: 'A DevSecOps CLI assistant powered by local AI',
  
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Commands', link: '/commands/' },
      { text: 'Configuration', link: '/configuration/' },
      { text: 'Examples', link: '/examples/' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is DSO?', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Getting Started', link: '/guide/getting-started' }
          ]
        },
        {
          text: 'Concepts',
          items: [
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Ollama Integration', link: '/guide/ollama' },
            { text: 'Scanners', link: '/guide/scanners' }
          ]
        }
      ],
      '/commands/': [
        {
          text: 'Overview',
          items: [
            { text: 'Commands', link: '/commands/' }
          ]
        },
        {
          text: 'Main Commands',
          items: [
            { text: 'audit', link: '/commands/audit' },
            { text: 'fix', link: '/commands/fix' },
            { text: 'why', link: '/commands/why' },
            { text: 'pr', link: '/commands/pr' }
          ]
        },
        {
          text: 'Tools & Configuration',
          items: [
            { text: 'check', link: '/commands/check' },
            { text: 'tools', link: '/commands/tools' },
            { text: 'watch', link: '/commands/watch' }
          ]
        },
        {
          text: 'Generation',
          items: [
            { text: 'policy', link: '/commands/policy' },
            { text: 'sbom', link: '/commands/sbom' },
            { text: 'ci', link: '/commands/ci' }
          ]
        }
      ],
      '/configuration/': [
        {
          text: 'Configuration',
          items: [
            { text: 'Overview', link: '/configuration/' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Usage Examples', link: '/examples/' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/isma-dev/dso' }
    ],
    
    footer: {
      message: 'Made with ❤️ for DevSecOps engineers',
      copyright: 'Copyright © 2024 DSO Contributors'
    },
    
    search: {
      provider: 'local'
    }
  },
  
  markdown: {
    theme: {
      light: 'catppuccin-latte',
      dark: 'catppuccin-mocha'
    }
  }
})

