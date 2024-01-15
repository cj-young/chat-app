import { getReqSession, isVerifiedReqSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const socketId = data.get("socket_id") as string;
    await dbConnect();

    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return authFailed();
    const {
      session: { user }
    } = reqSession;

    const authResponse = pusherServer.authenticateUser(socketId, {
      id: user.id
    });
    return NextResponse.json(authResponse);
  } catch (error) {
    return authFailed();
  }
}

function authFailed() {
  return NextResponse.json({}, { status: 403 });
}
