export const runtime = 'edge';

export async function GET() {
  return Response.json({ message: 'Test route works!' }, { status: 200 });
}

export async function POST() {
  return Response.json({ message: 'POST test route works!' }, { status: 200 });
}
