"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { ViewTransition } from "react";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { createPost, revalidateFeed } from "./actions";
import type { FeedPost } from "./queries";

const client = generateClient<Schema>();

export function FeedClient({ posts }: { posts: FeedPost[] }) {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [optimisticPosts, addOptimisticPost] = useOptimistic(
    posts,
    (current, next: FeedPost) => [next, ...current.filter((post) => post.id !== next.id)],
  );
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    const nextBody = body.trim();
    if (!nextTitle) return;

    const optimistic: FeedPost = {
      id: `optimistic-${Date.now()}`,
      title: nextTitle,
      body: nextBody,
      createdAt: new Date().toISOString(),
    };

    setError(null);
    setTitle("");
    setBody("");

    startTransition(async () => {
      addOptimisticPost(optimistic);
      try {
        await createPost(nextTitle, nextBody);
      } catch (serverError) {
        try {
          const { data, errors } = await client.models.Post.create({
            title: nextTitle,
            body: nextBody,
          });
          if (errors?.length || !data) {
            throw new Error(errors?.[0]?.message ?? "Failed to create post");
          }
          await revalidateFeed(data.id);
        } catch (fallbackError) {
          setError(
            fallbackError instanceof Error
              ? fallbackError.message
              : serverError instanceof Error
                ? serverError.message
                : "Could not create post",
          );
        }
      }
    });
  }

  return (
    <>
      {authStatus === "authenticated" ? (
        <form className="feed-form feed-card" onSubmit={handleSubmit}>
          <strong>New post</strong>
          <span className="feed-muted">
            This demonstrates useOptimistic + Server Actions, then updateTag.
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            required
          />
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Body (optional)"
          />
          <button type="submit" disabled={isPending}>
            {isPending ? "Posting…" : "Publish"}
          </button>
          {error ? <p className="feed-error">{error}</p> : null}
        </form>
      ) : (
        <div className="feed-card auth-compact">
          <strong>Sign in to post</strong>
          <p className="feed-muted">
            Feed reads are public (API key). Writes need the Cognito user from
            the Todos authenticator.
          </p>
          <Authenticator loginMechanisms={["email"]} />
        </div>
      )}

      {optimisticPosts.length === 0 ? (
        <p className="feed-empty">No posts yet. Publish the first one.</p>
      ) : (
        <div className="feed-list">
          {optimisticPosts.map((post) => (
            <ViewTransition key={post.id} name={`post-${post.id}`}>
              <article className="feed-card">
                <Link href={`/feed/${post.id}`} prefetch={true}>
                  {post.title}
                </Link>
                {post.body ? <p>{post.body}</p> : null}
              </article>
            </ViewTransition>
          ))}
        </div>
      )}
    </>
  );
}
