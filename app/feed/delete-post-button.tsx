"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { deletePost } from "./actions";

export function DeletePostButton({ id }: { id: string }) {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (authStatus !== "authenticated") return null;

  return (
    <div className="feed-actions">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await deletePost(id);
              router.push("/feed");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Delete failed");
            }
          });
        }}
      >
        {isPending ? "Deleting…" : "Delete post"}
      </button>
      {error ? <p className="feed-error">{error}</p> : null}
    </div>
  );
}
