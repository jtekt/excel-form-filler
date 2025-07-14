import { Next, Context } from "hono"
import { HTTPException } from "hono/http-exception"
import createJwksClient from "jwks-rsa"
import jwt from "jsonwebtoken"

type Options = {
    jwksUri: string
}

export default ({ jwksUri }: Options) => {
    const jwksClient = createJwksClient({
        jwksUri,
        cache: true,
        rateLimit: true,
    })

    return async (c: Context, next: Next) => {
        const authorizationHeader = c.req.header("Authorization")

        if (!authorizationHeader)
            throw new HTTPException(401, { message: "Authorization header not set" })
        const token = authorizationHeader.split(" ")[1] ?? authorizationHeader

        if (!token) throw new Error("Missing token")

        const decoded = jwt.decode(token, { complete: true })
        if (!decoded) throw new Error(`Decoded token is null`)

        const kid = decoded.header?.kid
        if (!kid) throw new Error("Missing token kid")

        const key = await jwksClient.getSigningKey(kid)

        const user = jwt.verify(token, key.getPublicKey())

        c.set("user", user)
        await next()
    }
}