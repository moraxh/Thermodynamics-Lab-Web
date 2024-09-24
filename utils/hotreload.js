// Live reload
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';

const liveReloadServer = livereload.createServer();

export const hotreload = (app, __dirname) => {
    liveReloadServer.watch(__dirname + "/");
    app.use(connectLiveReload());
}

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    console.log("Live reloading...");
    liveReloadServer.refresh("/");
  }, 100);
});