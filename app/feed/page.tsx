import { listPosts } from "./queries";
import { FeedClient } from "./feed-client";
import "./feed.css";

export default async function FeedPage() {
  const posts = await listPosts();

  return (
    <div className="feed">
      <h1>Feed</h1>
      <p className="feed-lead">
        This demonstrates Instant Navigations, Cache Components, Partial
        Prefetch, and optimistic Server Actions.
      </p>
      <FeedClient posts={posts} />
    </div>
  );
}
