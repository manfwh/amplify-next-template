"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { createComment, revalidateFeed } from "./actions";
import type { FeedComment } from "./queries";

const client = generateClient<Schema>();

export function CommentsClient({
  postId,
  comments,
}: {
  postId: string;
  comments: FeedComment[];
}) {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (current, next: FeedComment) => [...current, next],
  );
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextContent = content.trim();
    if (!nextContent) return;

    const optimistic: FeedComment = {
      id: `optimistic-${Date.now()}`,
      content: nextContent,
      postId,
      createdAt: new Date().toISOString(),
    };

    setError(null);
    setContent("");

    startTransition(async () => {
      addOptimisticComment(optimistic);
      try {
        await createComment(postId, nextContent);
      } catch (serverError) {
        try {
          const { data, errors } = await client.models.Comment.create({
            postId,
            content: nextContent,
          });
          if (errors?.length || !data) {
            throw new Error(errors?.[0]?.message ?? "Failed to create comment");
          }
          await revalidateFeed(postId);
        } catch (fallbackError) {
          setError(
            fallbackError instanceof Error
              ? fallbackError.message
              : serverError instanceof Error
                ? serverError.message
                : "Could not add comment",
          );
        }
      }
    });
  }

  return (
    <div className="feed-comments">
      <h2>Comments</h2>
      <p className="feed-lead">
        Nested Suspense streams this list after a short delay so the fallback is
        visible.
      </p>
      {optimisticComments.length === 0 ? (
        <p className="feed-empty">No comments yet.</p>
      ) : (
        optimisticComments.map((comment) => (
          <article key={comment.id} className="feed-comment">
            {comment.content}
          </article>
        ))
      )}

      {authStatus === "authenticated" ? (
        <form className="feed-form" onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write a comment"
            required
          />
          <button type="submit" disabled={isPending}>
            {isPending ? "Sending…" : "Comment"}
          </button>
          {error ? <p className="feed-error">{error}</p> : null}
        </form>
      ) : (
        <div className="feed-card auth-compact">
          <strong>Sign in to comment</strong>
          <Authenticator loginMechanisms={["email"]} />
        </div>
      )}
    </div>
  );
}
