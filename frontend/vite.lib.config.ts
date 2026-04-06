import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vite.dev/guide/build#library-mode
export default defineConfig({
  publicDir: false,
  plugins: [
    react(),
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
      include: ['src'],
      exclude: [
        'src/main.tsx',
        'src/App.tsx',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.stories.ts',
        '**/*.stories.tsx',
      ],
      outDir: 'dist',
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@amulya_maggidi/ai-design-system',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
  external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
  output: {
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  },
},
    sourcemap: false,
    cssCodeSplit: false,
  },
})
