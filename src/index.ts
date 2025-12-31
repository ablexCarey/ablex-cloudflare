/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const buildCorsHeaders = (request: Request) => {
  const origin = request.headers.get("Origin") ?? "*";
  const requestHeaders = request.headers.get("Access-Control-Request-Headers");

  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    requestHeaders ?? "Content-Type, Authorization",
  );
  headers.set("Access-Control-Max-Age", "86400");
  return headers;
};

const addAccessControlHeaders = (response: Response, request: Request) => {
  const wrappedResponse = new Response(response.body, response);
  const corsHeaders = buildCorsHeaders(request);
  corsHeaders.forEach((value, key) => wrappedResponse.headers.set(key, value));
  return wrappedResponse;
};

const addBrowserIsolationHeaders = (response: Response) => {
  const wrappedResponse = new Response(response.body, response);
  wrappedResponse.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  wrappedResponse.headers.set("Cross-Origin-Embedder-Policy", "credentialless");
  return wrappedResponse;
};

export default {
  async fetch(request: Request) {
    const requestUrl = new URL(request.url);

    if (requestUrl.hostname.startsWith("functions-local")) {
      if (request.method === "OPTIONS") {
        // Short-circuit preflight so it always returns an OK response with CORS headers.
        return new Response(null, { status: 204, headers: buildCorsHeaders(request) });
      }

      const response = await fetch(request);
      return addAccessControlHeaders(response, request);
    }

    if (requestUrl.pathname.startsWith("/__/auth/")) {
      let firebaseProjectUrl = "https://ablex-production.firebaseapp.com";
      if (requestUrl.hostname.startsWith("dev.")) {
        firebaseProjectUrl = "https://ablex-development.firebaseapp.com";
      } else if (requestUrl.hostname.startsWith("staging")) {
        firebaseProjectUrl = "https://ablex-staging.firebaseapp.com";
      }

      const transformedUrl = new URL(
        firebaseProjectUrl + requestUrl.pathname + requestUrl.search,
      );
      const newRequest = new Request(transformedUrl.toString(), request);
      const response = await fetch(newRequest);
      return addBrowserIsolationHeaders(response);
    }

    return addBrowserIsolationHeaders(
      new Response("Not found", { status: 404 }),
    );
  },
};
