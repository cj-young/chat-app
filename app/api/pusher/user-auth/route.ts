import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const socketId = data.get("socket_id") as string;
    await dbConnect();

    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return authFailed();

    const { query, userType } = getSession(sessionId);
    if (!query || userType !== "verified") return authFailed();
    const session = await query;
    if (!session) return authFailed();
    const { user: userId } = session;

    const authResponse = pusherServer.authenticateUser(socketId, {
      id: userId.toString()
    });
    return NextResponse.json(authResponse);
  } catch (error) {
    return authFailed();
  }
}

function authFailed() {
  return NextResponse.json({}, { status: 403 });
}
