import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    if(!req.auth) {
        return NextResponse.redirect(new URL("/login", req.url))
    }
    if(req.auth.user?.twoFactorPending && req.nextUrl.pathname !== "/verify-otp")
        return NextResponse.redirect(new URL("/verify-otp", req.url))
})

export const config = {
    matcher: ["/account", "/adminconsole", "/dashboard", "/verify-otp"],
}