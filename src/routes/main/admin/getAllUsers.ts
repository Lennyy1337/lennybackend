import { FastifyReply, FastifyRequest } from "fastify"
import { prisma } from "../../../init/prisma"

export async function getUsersHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        // @ts-ignore

        const { authorization } = request.headers;
        
        const users = await prisma.user.findMany({
            omit: { password: true },
        })

        reply.send({ success: true, message: "Success!", data: users })
    } catch (e) {
        console.log(e)
        reply
            .code(500)
            .send({ success: false, message: "Internal server error" })
    }
}
