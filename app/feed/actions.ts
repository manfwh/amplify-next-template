"use server";

import { updateTag } from "next/cache";
import { getCookieClient } from "@/app/amplify-cookies";
import type { FeedComment, FeedPost } from "./queries";

function firstErrorMessage(errors: { message?: string }[] | undefined, fallback: string) {
  return errors?.[0]?.message ?? fallback;
}

export async function createPost(title: string, body: string): Promise<FeedPost> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error("Title is required");
  }

  const client = getCookieClient();
  const { data, errors } = await client.models.Post.create({
    title: trimmedTitle,
    body: body.trim(),
  });

  if (errors?.length || !data) {
    throw new Error(firstErrorMessage(errors, "Failed to create post"));
  }

  updateTag("posts");
  updateTag(`post-${data.id}`);

  return {
    id: data.id,
    title: data.title,
    body: data.body ?? "",
    createdAt: data.createdAt ?? null,
    owner: data.owner ?? null,
  };
}

export async function createComment(postId: string, content: string): Promise<FeedComment> {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Comment is required");
  }

  const client = getCookieClient();
  const { data, errors } = await client.models.Comment.create({
    postId,
    content: trimmed,
  });

  if (errors?.length || !data) {
    throw new Error(firstErrorMessage(errors, "Failed to create comment"));
  }

  updateTag("posts");
  updateTag(`post-${postId}`);

  return {
    id: data.id,
    content: data.content,
    postId: data.postId,
    createdAt: data.createdAt ?? null,
    owner: data.owner ?? null,
  };
}

export async function deletePost(id: string): Promise<void> {
  const client = getCookieClient();
  const { errors } = await client.models.Post.delete({ id });
  if (errors?.length) {
    throw new Error(firstErrorMessage(errors, "Failed to delete post"));
  }
  updateTag("posts");
  updateTag(`post-${id}`);
}

export async function revalidateFeed(postId?: string): Promise<void> {
  updateTag("posts");
  if (postId) {
    updateTag(`post-${postId}`);
  }
}
