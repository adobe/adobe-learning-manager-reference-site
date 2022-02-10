export default async function () {
    return import(/* webpackChunkName: "i18n/[request]" */ `./en`);
}