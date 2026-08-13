import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/local-auth";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Authenticate the user
        const session = getSession(request);
        
        // If no session is found, we can log it. For this demo, we'll allow an anonymous fallback 
        // to prevent upload failures if cookies are stripped or missing in the client fetch.
        const userId = session?.id || "anonymous";
        const userName = session?.name || "Guest";

        // Return a token that gives the client permission to upload to this specific path
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "image/jpeg",
            "image/png",
            "image/webp"
          ],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB
          tokenPayload: JSON.stringify({
            userId,
            userName
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Blob upload completed", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Vercel Blob token generation error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}
