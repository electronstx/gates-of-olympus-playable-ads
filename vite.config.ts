import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
    plugins: [viteSingleFile()],
    build: {
        assetsInlineLimit: 100000000,
        cssCodeSplit: false,
        assetsDir: 'assets',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
            external: [],
        },
        target: 'esnext',
    },
})
