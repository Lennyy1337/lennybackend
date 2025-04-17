"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = router;
const fastify_1 = require("./init/fastify");
const login_1 = require("./routes/auth/login");
const register_1 = require("./routes/auth/register");
const generateKey_1 = require("./routes/main/key/generateKey");
const getuploadedfiles_1 = require("./routes/main/getuploadedfiles");
const getSxcu_1 = require("./routes/main/sharex/getsxcu/getSxcu");
const upload_1 = require("./routes/main/upload");
const redeemKey_1 = require("./routes/main/key/redeemKey");
function router() {
    fastify_1.fastify.register(register_1.registerRoute);
    fastify_1.fastify.register(login_1.loginRoute);
    fastify_1.fastify.register(upload_1.uploadRoute);
    fastify_1.fastify.register(getuploadedfiles_1.getUploadedFilesRoute);
    fastify_1.fastify.register(getSxcu_1.getSxcuRoute);
    fastify_1.fastify.register(generateKey_1.generateKey);
    fastify_1.fastify.register(redeemKey_1.redeemKey);
}
