declare module 'next-pwa' {
  import { NextConfig } from 'next'
  
  interface PWAConfig {
    dest?: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
    runtimeCaching?: Array<{
      urlPattern: string | RegExp
      handler: string
      options?: {
        cacheName?: string
        expiration?: {
          maxEntries?: number
          maxAgeSeconds?: number
        }
      }
    }>
  }
  
  interface NextPWAConfig extends NextConfig {
    pwa?: PWAConfig
  }
  
  function withPWA(config: NextPWAConfig): NextConfig
  
  export = withPWA
}

