export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // CEK KEY (Dipanggil otomatis oleh Web Pembeli setiap 4 detik)
    if (url.pathname === "/check") {
      const oid = url.searchParams.get("oid");
      if (!oid) return new Response("Missing OID", { status: 400, headers: corsHeaders });
      
      const key = await env.MADOUK_KV.get(oid);
      return new Response(JSON.stringify({ key: key }), { headers: corsHeaders });
    }

    // SET KEY (Link yang Lu klik di HP buat ngirim Key ke Web)
    if (url.pathname === "/setkey") {
      const oid = url.searchParams.get("oid");
      const val = url.searchParams.get("val");
      if (!oid || !val) return new Response("Missing Data", { status: 400, headers: corsHeaders });

      await env.MADOUK_KV.put(oid, val, { expirationTtl: 86400 }); // Key hapus otomatis dalam 24 jam biar storage gak penuh
      return new Response(`SUKSES: Key ${val} terpasang untuk Order ${oid}`, { headers: corsHeaders });
    }

    return new Response("Madouk API is Running", { headers: corsHeaders });
  }
};
