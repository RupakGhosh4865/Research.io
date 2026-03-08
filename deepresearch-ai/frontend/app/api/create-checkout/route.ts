import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import api from "@/lib/api"

export async function POST(req: Request) {
    const { userId, getToken } = auth()
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 })
    }
    
    try {
        const body = await req.json()
        const token = await getToken()
        
        // This acts as a proxy to backend which securely creates the stripe session
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/payments/create-checkout-session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        })
        
        if (!res.ok) throw new Error("Backend failed to create checkout")
        const data = await res.json()
        return NextResponse.json(data)
    } catch (e) {
        console.error(e)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
