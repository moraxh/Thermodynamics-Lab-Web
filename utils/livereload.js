import path from 'node:path'
import browserSync from 'browser-sync'

export const initLiveReload = () => {
  browserSync.init({
    proxy: `http://localhost:${process.env.PORT || 3000}`,
    files: [path.join(process.cwd(), 'src/views/**/*.*'), path.join(process.cwd(), 'public/css/**/*.*')],
    port: 4000,
    open: false
  })
}
