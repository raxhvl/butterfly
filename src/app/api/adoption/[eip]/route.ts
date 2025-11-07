import { NextRequest, NextResponse } from "next/server";
import clientsData from "@/data/clients.json";
import { buildEIPAdoptionData } from "@/lib/utils";
import { Clients, EIPAdoption } from "@/types";
import { config } from "@/config/app";
import { getEIPTestResults, getEIPMetadata } from "@/lib/manifest";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eip: string }> }
) {
  const { eip: eipNumber } = await params;

  try {
    // Load test results and metadata from fork structure
    const testResults = getEIPTestResults(config.currentFork, eipNumber);
    const eipMetadata = getEIPMetadata(config.currentFork, eipNumber);
    const clients = clientsData as Clients;

    if (!eipMetadata) {
      throw new Error("EIP metadata not found");
    }

    // Build response using shared utility
    const response: EIPAdoption = buildEIPAdoptionData(
      eipNumber,
      eipMetadata.spec,
      testResults.tests,
      testResults.lastUpdated,
      clients
    );

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": `public, max-age=${config.api.cache.maxAge}, s-maxage=${config.api.cache.staleWhileRevalidate}`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error(`Error loading EIP ${eipNumber}:`, error);
    return NextResponse.json(
      { error: "EIP not found", eip: eipNumber },
      { status: 404 }
    );
  }
}
