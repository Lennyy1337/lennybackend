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
exports.getUsersHandler = getUsersHandler;
const prisma_1 = require("../../../init/prisma");
function getUsersHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // @ts-ignore
            const { authorization } = request.headers;
            const users = yield prisma_1.prisma.user.findMany({
                omit: { password: true },
            });
            reply.send({ success: true, message: "Success!", data: users });
        }
        catch (e) {
            console.log(e);
            reply
                .code(500)
                .send({ success: false, message: "Internal server error" });
        }
    });
}
