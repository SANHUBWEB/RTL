// Cloudflare Worker: gives AAISA CCTV short-lived Cloudflare Realtime TURN credentials.
// Variables to add in the Worker settings:
//   TURN_KEY_ID         (secret) from Cloudflare dashboard > Realtime > TURN keys
//   TURN_KEY_API_TOKEN  (secret) the API token shown when you create that TURN key
//   ALLOWED_ORIGIN      (optional) e.g. https://yourname.github.io  (blocks other sites)
export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    if (env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) {
      return new Response("forbidden", { status: 403 });
    }
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Headers": "*",
      "Content-Type": "application/json",
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });

    const r = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ttl: 86400 }),
      }
    );
    return new Response(await r.text(), { status: r.status, headers: cors });
  },
};
