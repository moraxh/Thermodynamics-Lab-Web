import path from 'node:path'
import browserSync from 'browser-sync'

export const initLiveReload = () => {
  browserSync.init({
    proxy: `http://localhost:${process.env.PORT || 3000}`,
    files: [path.join(process.cwd(), 'src/views/**/*.*')],
    port: 4000,
    open: false
  })
}
