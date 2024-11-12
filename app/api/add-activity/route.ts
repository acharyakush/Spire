import { Prisma } from "@prisma/client";
import { prisma } from "@/utilities/global";
import { NextApiRequest, NextApiResponse } from "next";
import { AddActivityApiReponse } from "@/utilities/interfaces";

export default async function POST(
  request: NextApiRequest,
  response: NextApiResponse<AddActivityApiReponse<null>>,
): Promise<void> {
  if (request.method !== "POST") {
    response.status(405).json({ success: false, error: "Method Not Allowed" });
    return;
  }

  const ipAddress: string | any =
    request.headers["x-forwarded-for"] || request.socket.remoteAddress || "";

  const userAgent: string = request.headers["user-agent"] || "";

  const { user_id, activity, session_id }: Prisma.activitiesCreateInput =
    request.body;

  try {
    await prisma.activities.create({
      data: {
        user_id,
        activity,
        ip_address: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        user_agent: userAgent,
        session_id,
      },
    });
    response.status(200).json({ success: true });
  } catch (error) {
    response
      .status(500)
      .json({ success: false, error: "Failed to add activity." });
  }
}
