import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const profiles = formData.get("profiles") as string;
    const count = formData.get("count") as string;
    const metric = formData.get("metric") as string;
    const file = formData.get("file") as File | null;

    // Handle profiles input - split by commas and clean
    let profileList: string[] = [];
    if (profiles) {
      profileList = profiles.split(",").map(p => p.trim()).filter(Boolean);
    }
    
    // Handle CSV file if uploaded
    if (file) {
      const text = await file.text();
      const lines = text.split("\n");
      // Assuming first line is header
      const headers = lines[0].split(",");
      const profileIndex = headers.findIndex(h => 
        h.toLowerCase().includes("profile") || h.toLowerCase().includes("username")
      );
      
      if (profileIndex === -1) {
        throw new Error("CSV must contain a profile or username column");
      }

      const csvProfiles = lines
        .slice(1)
        .map(line => line.split(",")[profileIndex]?.trim())
        .filter(Boolean);
      
      profileList = [...profileList, ...csvProfiles];
    }

    if (!profileList.length) {
      throw new Error("No valid profiles provided");
    }

    // Remove duplicates using Array.from instead of spread
    profileList = Array.from(new Set(profileList));

    // Parse count with defaults
    const numTweets = count ? parseInt(count) : 100;
    if (numTweets > 200) {
      throw new Error("Maximum tweet count is 200");
    }

    // Call your API here
    const data = {
      profiles: profileList,
      count: numTweets,
      metric
    };

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}