const { defineConfig } = require('@vue/cli-service')
const fs = require('fs')
const path = require('path')

// ── Carga tus certificados SSL ────────────────────────────────────────────
// Coloca los archivos en: BioTech/ssl/cert.pem  y  BioTech/ssl/key.pem
// Si los tienes con otro nombre, cámbialos aquí.
const sslDir  = path.resolve(__dirname, 'certificate')
const sslCert = path.join(sslDir, 'cert.pem')
const sslKey  = path.join(sslDir, 'key.pem')
const useHttps = fs.existsSync(sslCert) && fs.existsSync(sslKey)

if (useHttps) {
  console.log('🔒 HTTPS activado con certificados en /certificate')
} else {
  console.log('⚠️  Certificados SSL no encontrados en /certificate — usando HTTP')
}

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // ── HTTPS ──────────────────────────────────────────────────────────
    https: useHttps
      ? { key: fs.readFileSync(sslKey), cert: fs.readFileSync(sslCert) }
      : false,

    host: '0.0.0.0',
    port: 8081,
    hot:  true,
    open: false,
    allowedHosts: 'all',

    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      // ── Cabeceras de seguridad ──────────────────────────────────────
      'X-Content-Type-Options':  'nosniff',
      'X-Frame-Options':         'DENY',
      'X-XSS-Protection':        '1; mode=block',
      'Referrer-Policy':         'strict-origin-when-cross-origin',
    },

    client: {
      webSocketURL: useHttps
        ? 'wss://0.0.0.0:8081/ws'
        : 'ws://0.0.0.0:8081/ws',
    },

    // ── Proxy al backend Python ─────────────────────────────────────
    proxy: {
      '/api': {
        target:       'http://127.0.0.1:8000',
        changeOrigin: true,
        secure:       false,
        ws:           true,
        logLevel:     'debug',
      },
    },
  },

  configureWebpack: {
    resolve: {
      fallback: { fs: false, path: false, http: false, https: false },
    },
  },
})