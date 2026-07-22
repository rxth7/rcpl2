import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/router";
import { createContext } from "../../server/context";

const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default async (request: Request) => {
  const url = new URL(request.url);
  url.pathname = url.pathname.replace(/^\/\.netlify\/functions\/api/, "/api") || "/api";

  return app.fetch(new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
  }));
};
