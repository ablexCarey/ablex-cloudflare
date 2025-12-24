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

 
export default {
  async fetch(request: Request) {
    const requestUrl = new URL(request.url);
	let firebaseProjectUrl = "https://ablex-production.firebaseapp.com";
    if (requestUrl.pathname.startsWith("/__/auth/")) {
		let firebaseProjectUrl = "https://ablex-production.firebaseapp.com";
		if(requestUrl.hostname.startsWith("ablex-development")) {
			firebaseProjectUrl = "https://ablex-development.firebaseapp.com";
		} else if(requestUrl.hostname.startsWith("ablex-staging")) {
			firebaseProjectUrl = "https://ablex-staging.firebaseapp.com";
		} 
      const transformedUrl = new URL(
        firebaseProjectUrl + requestUrl.pathname + requestUrl.search,
      );
      const newRequest = new Request(transformedUrl.toString(), request);
      return fetch(newRequest);
    }
    return new Response("Not found", { status: 404 });
  },
};