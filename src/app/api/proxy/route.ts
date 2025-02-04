export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const hatNo = url.searchParams.get("hat_no");

    let apiUrl =
      "https://acikveri.bizizmir.com/api/3/action/datastore_search?resource_id=0c791266-a2e4-4f14-82b8-9a9b102fbf94&limit=1000";

    if (hatNo) {
      apiUrl = `https://acikveri.bizizmir.com/api/3/action/datastore_search?resource_id=543f2249-c734-48e4-8739-72efbbfc843c&q=${hatNo}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return new Response("API hatası", { status: 500 });
  }
}
