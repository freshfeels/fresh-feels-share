// Netlify Edge Function: HTTP Basic Auth for /finance/* paths
// TEMPORARY DIAGNOSTIC: hardcoded credentials to test edge function
// username: freshfeels / password: testpass123

export default async function handler(request, context) {
    const username = "freshfeels";
    const password = "testpass123";

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
