import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const profiles = formData.get("profiles") as string;
    const count = formData.get("count") as string;
    const metric = formData.get("metric") as string;
    const file = formData.get("file") as File | null;

    if (!profiles && !file) {
      throw new Error("Please provide either profiles or a CSV file");
    }

    let profileList: string[] = [];
    
    if (profiles) {
      // Split by commas, trim whitespace, and filter out empty strings
      profileList = profiles.split(",")
        .map(p => p.trim())
        .filter(p => p.length > 0);
    }
    
    if (file) {
      const text = await file.text();
      const lines = text.split("\n");
      const headers = lines[0].split(",");
      const profileIndex = headers.findIndex(
        h => h.toLowerCase().includes("profile") || h.toLowerCase().includes("username")
      );
      
      if (profileIndex === -1) {
        throw new Error("CSV must contain a profile or username column");
      }
      
      const csvProfiles = lines
        .slice(1)
        .map(line => line.split(",")[profileIndex]?.trim())
        .filter(p => p && p.length > 0);
      
      profileList = [...profileList, ...csvProfiles];
    }

    if (profileList.length === 0) {
      throw new Error("No valid profiles found");
    }

    // Remove duplicates without using Set
    profileList = profileList.filter((profile, index) => 
      profileList.indexOf(profile) === index
    );

    const numTweets = count ? parseInt(count) : 100;
    if (numTweets > 200) {
      throw new Error("Maximum tweet count is 200");
    }

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