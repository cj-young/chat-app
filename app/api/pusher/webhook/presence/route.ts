import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();

  console.log("Data", data);

  return NextResponse.json({ message: "webhook response" });
}
