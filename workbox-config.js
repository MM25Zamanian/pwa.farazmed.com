export default {
  swDest: 'build/sw.js',
  globPatterns: ['**/*.{html,css,js,json,png,jpg,js,woff2,woff}'],
  globDirectory: 'build/',
  clientsClaim: true,
  skipWaiting: true,
  navigateFallback: '/index.html',
  runtimeCaching: [
    {
      urlPattern: new RegExp('(.*).(.jpg|.jpeg|.jfif|.pjpeg|.pjp|.png|.svg|.ico)'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'images',
        backgroundSync: {
          name: 'images-sync',
        },
      },
    },
    {
      urlPattern: new RegExp('(.*).(woff2|woff)'),
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts',
      },
    },
    {
      urlPattern: new RegExp('(.*)(.json)'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'data',
        backgroundSync: {
          name: 'external-cache-sync',
        },
      },
    },
    {
      urlPattern: new RegExp('(.*)(.js)'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'ionic-js',
      },
    },
  ],
};
