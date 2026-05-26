import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// In Tauri dev, the Rust side starts parser-service after cargo finishes scanning resources.
export default defineConfig({
    plugins: [
        vue(),
    ],
    resolve: {
        alias: {'@': '/src'},
    },
    clearScreen: false,
    server: {
        port: 15173,
        strictPort: true
    },
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                sourcemapPathTransform: (rel, src) =>
                    '/' +
                    path
                        .relative(process.cwd(), path.resolve(path.dirname(src), rel))
                        .replace(/\\/g, '/'),
            },
        }
    },
})
