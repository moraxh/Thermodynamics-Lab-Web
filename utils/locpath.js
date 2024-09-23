const view       = (path) => `./src/views/${path}`;
const controller = (path) => `./src/controllers/${path}`;
const model      = (path) => `./src/models/${path}`;
const util       = (path) => `./src/utils/${path}`;
const public_    = (path) => `./public/${path}`;

export const locpath = {
    view,
    controller,
    model,
    util,
    public_,
}