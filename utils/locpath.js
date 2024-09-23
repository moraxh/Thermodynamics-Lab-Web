const view       = (path) => "./src/views" + path;
const controller = (path) => "./controllers" + path;
const model      = (path) => "./models" + path;
const util       = (path) => "./utils" + path;
const public_    = (path) => "./public" + path;

export const locpath = {
    view,
    controller,
    model,
    util,
    public_,
}