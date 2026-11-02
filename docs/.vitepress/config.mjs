import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'DSO - DevSecOps Oracle',
  description: 'A DevSecOps CLI assistant powered by local AI',
  // Use repository base path on GitHub Pages.
  base: process.env.GITHUB_ACTIONS ? '/dso-cli/' : '/',
  // localhost URLs in the guides point to the locally running web UI.
  ignoreDeadLinks: 'localhostLinks',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'author', content: 'Ismail MOUYAHADA - Platform and DevSecOps Engineer' }]
  ],

  themeConfig: {
    // Catppuccin theme colors
    appearance: 'dark',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Commands', link: '/commands/' },
      { text: 'API', link: '/CLI_API_DOCUMENTATION.md' },
      { text: 'GitHub', link: 'https://github.com/dso-cli/dso-cli' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/getting-started' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Scanners', link: '/guide/scanners' },
            { text: 'Interactive UI', link: '/guide/interactive-ui' },
            { text: 'Web Interface', link: '/guide/web-interface' },
            { text: 'Ollama Integration', link: '/guide/ollama' }
          ]
        },
        {
          text: 'Roadmap',
          items: [
            { text: 'Future Plans', link: '/guide/roadmap' }
          ]
        }
      ],
      '/commands/': [
        {
          text: 'Commands',
          items: [
            { text: 'Overview', link: '/commands/' },
            { text: 'audit', link: '/commands/audit' },
            { text: 'check', link: '/commands/check' },
            { text: 'fix', link: '/commands/fix' },
            { text: 'why', link: '/commands/why' },
            { text: 'pr', link: '/commands/pr' },
            { text: 'tools', link: '/commands/tools' },
            { text: 'watch', link: '/commands/watch' },
            { text: 'policy', link: '/commands/policy' },
            { text: 'sbom', link: '/commands/sbom' },
            { text: 'ci', link: '/commands/ci' }
          ]
        }
      ]
    },

    footer: {
      message: 'Project created by Platform and DevSecOps Engineer Ismail MOUYAHADA',
      copyright: 'Copyright © 2024-2026 Ismail MOUYAHADA. All rights reserved. MIT License.'
    },

    search: {
      provider: 'local'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/dso-cli/dso-cli' }
    ],

    editLink: {
      pattern: 'https://github.com/dso-cli/dso-cli/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    codeTheme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})

