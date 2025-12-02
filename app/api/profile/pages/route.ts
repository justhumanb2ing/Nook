import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { createServerSupabaseClient } from "@/config/supabase";
import type { Tables } from "@/types/database.types";

type OwnerPages = Array<
  Pick<Tables<"pages">, "id" | "handle" | "title" | "ordering">
>;

export async function GET(_req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          status: "error",
          reason: "UNAUTHORIZED",
          message: "로그인이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const ownerId = _req.nextUrl.searchParams.get("ownerId");

    if (ownerId !== userId) {
      return NextResponse.json(
        {
          status: "error",
          reason: "FORBIDDEN",
          message: "페이지를 조회할 권한이 없습니다.",
        },
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("pages")
      .select("id, handle, title, ordering")
      .eq("owner_id", ownerId)
      .order("ordering", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { status: "success", pages: (data ?? []) as OwnerPages },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      {
        status: "error",
        reason: "UNKNOWN_ERROR",
        message: "페이지 목록을 불러오지 못했습니다.",
      },
      { status: 500 }
    );
  }
}
