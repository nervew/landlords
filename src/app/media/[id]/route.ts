import { query } from "@/lib/db/pool";

interface MediaRow {
  mime_type: string;
  sha256: string;
  content: Buffer;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await query<MediaRow>(
    `select pm.mime_type, pm.sha256, pm.content
     from property_media pm
     join properties p on p.id = pm.property_id
     where pm.id = $1 and p.status = 'published'`,
    [id],
  );
  const media = result.rows[0];
  if (!media) return new Response("No encontrada", { status: 404 });

  const etag = `"${media.sha256}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  return new Response(new Uint8Array(media.content), {
    headers: {
      "Content-Type": media.mime_type,
      "Content-Length": String(media.content.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: etag,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
