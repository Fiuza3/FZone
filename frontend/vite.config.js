import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  plugins: [
    vue(),
    nodeResolve(),
    commonjs()
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
    cssCodeSplit: true
  }
})