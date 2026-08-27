import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";

let configured = false;

export function configureAmplify() {
  if (configured) return;
  Amplify.configure(outputs, { ssr: true });
  configured = true;
}

export function getPublicClient() {
  configureAmplify();
  return generateClient<Schema>({ authMode: "apiKey" });
}
