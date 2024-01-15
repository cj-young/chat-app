import {
  getReqSession,
  invalidSession,
  isVerifiedReqSession
} from "@/lib/auth";
import User from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqSession = await getReqSession(req);
    if (!isVerifiedReqSession(reqSession)) return invalidSession();
    const {
      session: { user }
    } = reqSession;

    const { serverId, newUiOrder } = (await req.json()) as {
      serverId: string;
      newUiOrder: number;
    };
    if (!serverId || !isValidObjectId(serverId))
      return NextResponse.json(
        { message: "Invalid server ID" },
        { status: 400 }
      );
    if (newUiOrder === undefined)
      return NextResponse.json(
        { message: "UI order not provided" },
        { status: 400 }
      );

    const serverObject = user.servers.find(
      (server) => server.server.toString() === serverId
    );
    if (!serverObject)
      return NextResponse.json(
        { message: "Invalid server ID" },
        { status: 400 }
      );
    const oldUiOrder = serverObject.uiOrder;

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        $inc: { "servers.$[case1].uiOrder": -1, "servers.$[case2].uiOrder": 1 },
        $set: { "servers.$[idMatch].uiOrder": newUiOrder }
      },
      {
        arrayFilters: [
          {
            "case1.uiOrder": {
              $gt: oldUiOrder,
              $lte: newUiOrder
            }
          },
          {
            "case2.uiOrder": {
              $lt: oldUiOrder,
              $gte: newUiOrder
            }
          },
          {
            "idMatch.server": serverId
          }
        ],
        new: true
      }
    );

    return NextResponse.json({ message: "Successfully updated UI order" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
