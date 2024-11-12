import { SignJWT } from "jose";
import { MyGlobal, prisma } from "@/utilities/global";
import { NextApiRequest, NextApiResponse } from "next";
import {
  AuthenticationRequest,
  AuthenticationResponse,
} from "@/utilities/interfaces";

const JWT_EXPIRATION = "24h";
const JWT_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_SECRET_KEY);

export async function POST(
  request: NextApiRequest,
  response: NextApiResponse<AuthenticationResponse<{ token: string }>>,
): Promise<void> {
  if (request.method !== "POST") {
    return response
      .status(405)
      .json({ success: false, error: "Method Not Allowed" });
  }

  const parsedCredentials = MyGlobal.deobfuscate(request.body.credentials);
  const { emailAddress, password } =
    parsedCredentials as unknown as AuthenticationRequest;

  try {
    let user;

    if (emailAddress.split("@").at(1) === "admins.spire.com") {
      user = await prisma.administrators.findUnique({
        where: { email_address: emailAddress },
      });
    } else {
      user = await prisma.employees.findUnique({
        where: { email_address: emailAddress },
      });
    }

    if (!user) {
      return response
        .status(404)
        .json({ success: false, error: "No user found." });
    }

    const isPasswordValid = await MyGlobal.verifyPassword(
      user.password,
      password,
    );

    if (!isPasswordValid) {
      return response
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }

    const token = await new SignJWT({ id: user.id, email: user.email_address })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_EXPIRATION)
      .sign(JWT_SECRET);

    return response.status(200).json({ success: true, data: { token } });
  } catch (error) {
    console.error(`Login failed: ${error}`);

    return response.status(500).json({
      success: false,
      error: "Technical glitch occurred. Please contact support desk.",
    });
  }
}
