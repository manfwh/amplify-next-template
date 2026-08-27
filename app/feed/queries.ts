import { cacheLife, cacheTag } from "next/cache";
import { getPublicClient } from "@/app/amplify-server";

export type FeedPost = {
  id: string;
  title: string;
  body: string;
  createdAt?: string | null;
  owner?: string | null;
};

export type FeedComment = {
  id: string;
  content: string;
  postId: string;
  createdAt?: string | null;
  owner?: string | null;
};

function serializePost(post: {
  id: string;
  title: string;
  body?: string | null;
  createdAt?: string | null;
  owner?: string | null;
}): FeedPost {
  return {
    id: post.id,
    title: post.title,
    body: post.body ?? "",
    createdAt: post.createdAt ?? null,
    owner: post.owner ?? null,
  };
}

function serializeComment(comment: {
  id: string;
  content: string;
  postId: string;
  createdAt?: string | null;
  owner?: string | null;
}): FeedComment {
  return {
    id: comment.id,
    content: comment.content,
    postId: comment.postId,
    createdAt: comment.createdAt ?? null,
    owner: comment.owner ?? null,
  };
}

export async function listPosts(): Promise<FeedPost[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");

  const client = getPublicClient();
  const { data, errors } = await client.models.Post.list({ limit: 50 });
  if (errors?.length) {
    console.error("listPosts errors", errors);
  }

  return (data ?? [])
    .map(serializePost)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

export async function getPost(id: string): Promise<FeedPost | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts", `post-${id}`);

  const client = getPublicClient();
  const { data, errors } = await client.models.Post.get({ id });
  if (errors?.length) {
    console.error("getPost errors", errors);
  }
  return data ? serializePost(data) : null;
}

export async function listComments(postId: string): Promise<FeedComment[]> {
  // Uncached so nested Suspense can stream "fresh" comments.
  await new Promise((resolve) => setTimeout(resolve, 800));

  const client = getPublicClient();
  const { data, errors } = await client.models.Comment.list({
    filter: { postId: { eq: postId } },
    limit: 100,
  });
  if (errors?.length) {
    console.error("listComments errors", errors);
  }

  return (data ?? [])
    .map(serializeComment)
    .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
}
