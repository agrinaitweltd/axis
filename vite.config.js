import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main:           resolve(__dirname, 'index.html'),
        about:          resolve(__dirname, 'about.html'),
        contact:        resolve(__dirname, 'contact.html'),
        'export-import': resolve(__dirname, 'export-import.html'),
        sourcing:       resolve(__dirname, 'sourcing.html'),
        coffee:         resolve(__dirname, 'products/coffee.html'),
        fruits:         resolve(__dirname, 'products/fruits.html'),
        grains:         resolve(__dirname, 'products/grains.html'),
        'other-produce': resolve(__dirname, 'products/other-produce.html'),
      }
    }
  },
  server: {
    // Rewrite clean URLs to .html files in dev
    middlewareMode: false,
  },
  plugins: [
    {
      name: 'clean-urls',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url.split('?')[0]
          // Skip files with extensions, root, and Vite internals
          if (url === '/' || url.includes('.') || url.startsWith('/@') || url.startsWith('/src') || url.startsWith('/node_modules')) {
            return next()
          }
          // Rewrite /about -> /about.html, /products/coffee -> /products/coffee.html
          req.url = url + '.html' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '')
          next()
        })
      }
    }
  ]
})
