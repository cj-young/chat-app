import { getSession, invalidSession } from "@/lib/auth";
import User, { IUser } from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("received");
    const sessionId = req.cookies.get("session")?.value;
    if (!sessionId) return invalidSession();

    const { userType, query } = getSession(sessionId);
    if (!query || userType !== "verified") return invalidSession();

    const session = await query.populate<{ user: IUser }>("user");
    if (!session || session.isExpired() || !session.user)
      return invalidSession();

    const { user } = session;

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

    // const updated = await User.findByIdAndUpdate(user.id, {
    //   $set: {
    //     "servers.$[].uiOrder": {
    //       $cond: {
    //         if: { $eq: ["$servers.$[].server", serverId] },
    //         then: newUiOrder,
    //         else: {
    //           $cond: {
    //             if: {
    //               $and: [
    //                 { $gt: ["$servers.$[].uiOrder", oldUiOrder] },
    //                 { $lte: ["$servers.$[].uiOrder", newUiOrder] },
    //               ],
    //             },
    //             then: { $subtract: ["$servers.$[].uiOrder", 1] },
    //             else: {
    //               $cond: {
    //                 if: {
    //                   $and: [
    //                     { $lt: ["$servers.$[].uiOrder", oldUiOrder] },
    //                     { $gte: ["$servers.$[].uiOrder", newUiOrder] },
    //                   ],
    //                 },
    //                 then: { $add: ["$servers.$[].uiOrder", 1] },
    //                 else: "$servers.$[].uiOrder",
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    console.log("old: ", oldUiOrder);
    console.log("new: ", newUiOrder);

    // const updated = await User.findByIdAndUpdate(
    //   user.id,

    //   {
    //     $set: {
    //       "servers.$[].uiOrder": {
    //         $cond: {
    //           if: { $eq: ["$servers.$[].server", serverId] },
    //           then: newUiOrder,
    //           else: {
    //             $cond: {
    //               if: {
    //                 $and: [
    //                   { $gt: ["$servers.$[].uiOrder", oldUiOrder] },
    //                   { $lte: ["$servers.$[].uiOrder", newUiOrder] }
    //                 ]
    //               },
    //               then: { $subtract: ["$servers.$[].uiOrder", 1] },
    //               else: {
    //                 $cond: {
    //                   if: {
    //                     $and: [
    //                       {
    //                         $lt: ["$servers.$[].uiOrder", oldUiOrder]
    //                       },
    //                       {
    //                         $gte: ["$servers.$[].uiOrder", newUiOrder]
    //                       }
    //                     ]
    //                   },
    //                   then: { $add: ["$servers.$[].uiOrder", 1] },
    //                   else: "$servers.$[].uiOrder"
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   },
    //   {
    //     new: true
    //   }
    // );

    const updated = await User.findByIdAndUpdate(
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

    console.log("here it is --");
    console.log(updated);

    return NextResponse.json({ message: "Successfully updated UI order" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
