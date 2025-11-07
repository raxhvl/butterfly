import { NextRequest, NextResponse } from "next/server";
import { getForkManifest, getAllEIPs } from "@/lib/manifest";
import { buildForkAdoptionData } from "@/lib/utils";
import { config } from "@/config/app";
import clientsData from "@/data/clients.json";
import { Clients, ForkAdoption } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fork: string }> }
) {
  const { fork: forkName } = await params;

  try {
    // Load fork manifest and clients
    const manifest = getForkManifest(forkName);
    const eips = getAllEIPs(forkName);
    const clients = clientsData as Clients;

    // Build fork adoption data using shared utility
    const { eipAdoptions, summary } = buildForkAdoptionData(forkName, eips, clients);

    const response: ForkAdoption = {
      name: manifest.name,
      description: manifest.description,
      summary,
      eips: eipAdoptions,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": `public, max-age=${config.api.cache.maxAge}, s-maxage=${config.api.cache.staleWhileRevalidate}`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error(`Error loading fork ${forkName}:`, error);
    return NextResponse.json(
      { error: "Fork not found", fork: forkName },
      { status: 404 }
    );
  }
}
