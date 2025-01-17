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
    
    // Handle comma-separated profiles
    if (profiles) {
      profileList = profiles.split(",").map(p => p.trim()).filter(p => p);
    }
    
    // Handle CSV file if provided
    if (file) {
      const text = await file.text();
      const lines = text.split("\n");
      const headers = lines[0].split(",");
      const profileIndex = headers.findIndex(
        (h) => h.toLowerCase().includes("profile") || h.toLowerCase().includes("username")
      );
      
      if (profileIndex === -1) {
        throw new Error("CSV must contain a profile or username column");
      }
      
      profileList = [
        ...profileList,
        ...lines
          .slice(1)
          .map((line) => line.split(",")[profileIndex].trim())
          .filter((p) => p),
      ];
    }

    if (profileList.length === 0) {
      throw new Error("No valid profiles found");
    }

    // Remove duplicates
    profileList = [...new Set(profileList)];

    const countNum = count ? parseInt(count) : 100;
    if (countNum > 200) {
      throw new Error("Maximum tweet count is 200");
    }

    // TODO: Replace with your actual API call
    const data = {
      profiles: profileList,
      count: countNum,
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