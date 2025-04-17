"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redeemKey = redeemKey;
const fastify_1 = require("../../../init/fastify");
const prisma_1 = require("../../../init/prisma");
const jwt_1 = require("../../../init/jwt");
function redeemKey() {
    return __awaiter(this, void 0, void 0, function* () {
        fastify_1.fastify.post("/key/redeem", function (request, reply) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const { authorization } = request.headers;
                    const { key } = request.body;
                    if (!authorization) {
                        reply.code(403).send({ success: false, message: "No authorization." });
                        return;
                    }
                    if (!key) {
                        reply.code(403).send({ success: false, message: "No key provided." });
                        return;
                    }
                    const keyDB = yield prisma_1.prisma.key.findUnique({
                        where: {
                            key: key,
                        },
                    });
                    if (!keyDB) {
                        reply.send({ success: false, message: "Invalid key provided." });
                        return;
                    }
                    const user = yield jwt_1.jwt.getUserFromJWT(authorization);
                    if (!user) {
                        reply.send({ success: false, message: "Invalid Authorization." });
                        return;
                    }
                    yield prisma_1.prisma.key.delete({
                        where: {
                            key: keyDB === null || keyDB === void 0 ? void 0 : keyDB.key,
                        },
                    });
                    yield prisma_1.prisma.user.update({
                        where: {
                            id: user.id,
                        },
                        data: {
                            role: keyDB === null || keyDB === void 0 ? void 0 : keyDB.type,
                        },
                    });
                    reply.send({ success: true, message: "Key Redeemed!" });
                }
                catch (e) {
                    if (e.message.includes("Expected KeyRoles")) {
                        reply.code(400).send({ success: false, message: "Invalid key type." });
                        return;
                    }
                    reply
                        .code(500)
                        .send({ success: false, message: "Internal Server Error." });
                    console.log("Error in generate Key;");
                    console.log(e);
                }
            });
        });
    });
}
