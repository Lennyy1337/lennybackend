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
exports.generateKey = generateKey;
const fastify_1 = require("../../../init/fastify");
const prisma_1 = require("../../../init/prisma");
const jwt_1 = require("../../../init/jwt");
const uuid_1 = require("uuid");
function generateKey() {
    return __awaiter(this, void 0, void 0, function* () {
        fastify_1.fastify.post("/key/generate", function (request, reply) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!request.body) {
                        reply
                            .code(400)
                            .send({ success: false, message: "This route requires a JSON body" });
                        return;
                    }
                    const { authorization } = request.headers;
                    const { type } = request.body;
                    if (!authorization) {
                        reply.code(403).send({ success: false, message: "No authorization" });
                        return;
                    }
                    if (!type) {
                        reply
                            .code(403)
                            .send({
                            success: false,
                            message: "Please set the desired whitelist type of the key.",
                        });
                        return;
                    }
                    const user = yield jwt_1.jwt.getUserFromJWT(authorization);
                    if (!user) {
                        reply.send({ success: false, message: "Invalid Authorization." });
                        return;
                    }
                    // why did i do this
                    let allowed = false;
                    if (user.role == "OWNER") {
                        allowed = true;
                    }
                    if (user.role == "STAFF") {
                        allowed = true;
                    }
                    if (!allowed) {
                        reply
                            .code(403)
                            .send({
                            success: false,
                            message: "You are not authorized to perform this action.",
                        });
                        return;
                    }
                    const key = yield prisma_1.prisma.key.create({
                        data: {
                            key: (0, uuid_1.v4)(),
                            type: type,
                        },
                    });
                    reply.send({ success: true, message: "Key created!", data: key });
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
