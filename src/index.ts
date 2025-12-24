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

const addBrowserIsolationHeaders = (response: Response) => {
  const wrappedResponse = new Response(response.body, response);
  wrappedResponse.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  wrappedResponse.headers.set("Cross-Origin-Embedder-Policy", "credentialless");
  return wrappedResponse;
};

export default {
  async fetch(request: Request) {
    const requestUrl = new URL(request.url);

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
