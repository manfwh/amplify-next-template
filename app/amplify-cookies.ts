import { cookies } from "next/headers";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";

export function getCookieClient() {
  return generateServerClientUsingCookies<Schema>({
    config: outputs,
    cookies,
  });
}
