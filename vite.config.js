import vue from '@vitejs/plugin-vue'

export default {
    plugins: [
        vue()
    ],
    build: {
        lib: {
            entry: 'src/main.js',
            name: 'VueWheelSpinner',
            fileName: 'vue-wheel-spinner'
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        }
    }
}
