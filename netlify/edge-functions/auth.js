// Netlify Edge Function: HTTP Basic Auth for /finance/* paths
// Credentials are set via Netlify environment variables:
//   FINANCE_USERNAME  (default: freshfeels)
//   FINANCE_PASSWORD  (required — set in Netlify dashboard)

export default async function handler(request, context) {
  const username = Deno.env.get("FINANCE_USERNAME") || "freshfeels";
  const password = Deno.env.get("FINANCE_PASSWORD") || "";

  // If no password is configured, block all access to be safe
  if (!password) {
    return new Response("Finance area is not yet configured.", { status: 503 });
  }

  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return unauthorised();
  }

  let user, pass;
  try {
    const decoded = atob(authHeader.slice("Basic ".length));
    [user, ...rest] = decoded.split(":");
    pass = rest.join(":"); // handle colons in passwords
  } catch {
    return unauthorised();
  }

  if (user !== username || pass !== password) {
    return unauthorised();
  }

  // Credentials valid — serve the request normally
  return context.next();
}

function unauthorised() {
  return new Response("Unauthorised — please enter your credentials.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Fresh Feels Finance", charset="UTF-8"',
      "Content-Type": "text/plain",
    },
  });
}

export const config = {
  path: "/finance/*",
};
