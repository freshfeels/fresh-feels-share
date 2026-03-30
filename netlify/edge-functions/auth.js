// Netlify Edge Function: HTTP Basic Auth for /finance/* paths
// Reads credentials from Netlify environment variables:
//   FINANCE_USERNAME (defaults to "freshfeels" if not set)
//   FINANCE_PASSWORD (required - if not set, access is allowed)

export default async function handler(request, context) {
  const username = Deno.env.get("FINANCE_USERNAME") || "freshfeels";
  const password = Deno.env.get("FINANCE_PASSWORD");

  // If no password configured, skip protection
  if (!password) {
    return context.next();
  }

  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return unauthorised();
  }

  let decoded;
  try {
    decoded = atob(authHeader.slice("Basic ".length));
  } catch {
    return unauthorised();
  }

  const colonIndex = decoded.indexOf(":");
  if (colonIndex === -1) {
    return unauthorised();
  }

  const user = decoded.slice(0, colonIndex);
  const pass = decoded.slice(colonIndex + 1);

  if (user !== username || pass !== password) {
    return unauthorised();
  }

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
