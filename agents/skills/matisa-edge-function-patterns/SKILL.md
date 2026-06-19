---
name: matisa-edge-function-patterns
description: Guidelines for building, deploying, and structuring Supabase Edge Functions in the Matisa project.
---

# Matisa Supabase Edge Function Patterns

The Matisa backend is migrating toward heavy usage of Supabase Edge Functions for complex AI calculations, ranking, and system orchestration. Adhere to the following rules when building or modifying Edge Functions.

## 1. File Structure & Imports
- Functions must reside in `supabase/functions/<function_name>/index.ts`.
- Use Deno imports securely. Always import `@supabase/supabase-js` via `esm.sh` or a similar reliable CDN with a fixed version (e.g., `https://esm.sh/@supabase/supabase-js@2.7.1`).
- `std/http/server.ts` must be used for serving requests.

## 2. CORS Handling
Every Edge Function must handle CORS to be accessible from the frontend Web app:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

if (req.method === "OPTIONS") {
  return new Response("ok", { headers: corsHeaders });
}
```

## 3. Client Initialization & Authentication
Always construct the Supabase client using the Authorization headers provided by the incoming request, so Row Level Security (RLS) is accurately enforced on behalf of the user executing the function:
```typescript
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
);
```
Never use the `SERVICE_ROLE_KEY` unless the function specifically requires elevated privileges (like bypassing RLS for a background job).

## 4. Response Formatting
- Ensure all successful responses return valid JSON and a `200` status.
- Wrap all business logic in a `try/catch` block. 
- Return a `400` status on handled errors, echoing the `error.message`.
- Always append the `corsHeaders` to the output `Response`.
