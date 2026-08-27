import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crossfade } from "../crossfade";
import { CommentsClient } from "../comment-form";
import { DeletePostButton } from "../delete-post-button";
import { getPost, listComments } from "../queries";
import "../feed.css";

function PostSkeleton() {
  return (
    <div className="feed-skeleton" aria-hidden="true">
      <div className="feed-skeleton-line short" />
      <div className="feed-skeleton-line medium" />
      <div className="feed-skeleton-line" />
    </div>
  );
}

function CommentsSkeleton() {
  return (
    <div className="feed-skeleton" aria-hidden="true">
      <div className="feed-skeleton-line short" />
      <div className="feed-skeleton-line" />
      <div className="feed-skeleton-line medium" />
    </div>
  );
}

async function PostDetail({
  params,
}: Pick<PageProps<"/feed/[id]">, "params">) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <article className="feed-card">
      <h1>{post.title}</h1>
      {post.body ? <p>{post.body}</p> : null}
      <DeletePostButton id={post.id} />
    </article>
  );
}

async function Comments({
  params,
}: Pick<PageProps<"/feed/[id]">, "params">) {
  const { id } = await params;
  const comments = await listComments(id);
  return <CommentsClient postId={id} comments={comments} />;
}

export default function Page(props: PageProps<"/feed/[id]">) {
  return (
    <div className="feed">
      <Link className="feed-back" href="/feed">
        Back
      </Link>
      <p className="feed-lead">
        Nested Suspense + cacheTag: the post can come from the cached shell,
        comments stream in as fresh data.
      </p>
      <Suspense fallback={<PostSkeleton />}>
        <Crossfade>
          <PostDetail params={props.params} />
          <Suspense fallback={<CommentsSkeleton />}>
            <Crossfade>
              <Comments params={props.params} />
            </Crossfade>
          </Suspense>
        </Crossfade>
      </Suspense>
    </div>
  );
}
