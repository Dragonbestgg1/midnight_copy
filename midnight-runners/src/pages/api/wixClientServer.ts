import { OAuthStrategy, createClient, TokenRole, RefreshToken } from "@wix/sdk";
import { products, collections } from "@wix/stores";
import { cart as currentCart } from "@wix/ecom";
import { randomBytes } from "crypto";

function generateSecureToken() {
  const secureToken = randomBytes(32).toString("hex");
  return { value: secureToken, role: "user" };
}

export default async function handler(req, res) {
  try {
    console.log("API Endpoint: Handler invoked");

    // Manage cookies using req and res objects
    let refreshToken = req.cookies.refreshToken ? JSON.parse(req.cookies.refreshToken) : null;

    if (!refreshToken) {
      console.log("Generating new refresh token");
      refreshToken = generateSecureToken();
      res.setHeader('Set-Cookie', `refreshToken=${JSON.stringify(refreshToken)}; Path=/; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}`);
    }

    const clientId = process.env.NEXT_PUBLIC_WIX_CLIENT_ID;
    if (!clientId) {
      throw new Error("Wix Client ID is missing.");
    }

    console.log("Creating Wix client");
    const wixClient = createClient({
      modules: {
        products,
        collections,
        currentCart,
      },
      auth: OAuthStrategy({
        clientId,
        tokens: {
          refreshToken,
          accessToken: { value: "", expiresAt: 0 },
        },
      }),
    });

    console.log("Wix client created successfully");
    return res.status(200).json({ client: wixClient });
  } catch (error) {
    console.error("API Endpoint Error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
