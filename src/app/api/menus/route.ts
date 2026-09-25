export const runtime = "nodejs";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const categoryFilter = searchParams.get("category")?.trim();
  const keywordFilter = searchParams.get("q")?.trim();

  try {
    const { getMenuList } = await import("@/db/queries/menus");
    const data = await getMenuList({ category: categoryFilter, keyword: keywordFilter });
    return Response.json({ data });
  } catch (error) {
    console.error("Failed to list menus", error);
    return Response.json(
      { error: "Menu sedang tidak dapat dimuat." },
      { status: 500 },
    );
  }
}
