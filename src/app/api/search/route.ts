import { NextRequest, NextResponse } from "next/server";
import { findGuestsByName } from "@/lib/services";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Le paramètre name est requis" },
      { status: 400 }
    );
  }

  try {
    const guests = await findGuestsByName(name);
    return NextResponse.json(guests);
  } catch (error) {
    console.error("Erreur lors de la recherche des invités:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche des invités" },
      { status: 500 }
    );
  }
}
