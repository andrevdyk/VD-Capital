"use client";

import {
  useState,
  useEffect,
} from "react";
import { fetchPosts } from "../../actions/posts";
import { PostCard } from "../../components/PostCard";

type Post = {
  id: string;
  content: string;
  media_urls: string[] | null;
  created_at: string;
  user_id: string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  liked_by_user: boolean;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
};

export function UserPosts({
  userId,
  limit,
}: {
  userId: string;
  limit?: number;
}) {
  const [posts, setPosts] = useState<
    Post[]
  >([]);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const result = await fetchPosts(
        userId,
        1,
        limit
      );
      if (
        result.success &&
        result.data
      ) {
        setPosts(result.data);
      }
      setLoading(false);
    };
    loadPosts();
  }, [userId, limit]);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (posts.length === 0) {
    return <div>No posts yet.</div>;
  }

  const photoPosts = posts.filter(
    (post) =>
      post.media_urls &&
      post.media_urls.length > 0
  );
  const textPosts = posts.filter(
    (post) =>
      !post.media_urls ||
      post.media_urls.length === 0
  );

  return (
    <div className="space-y-8">
      {photoPosts.length > 0 && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photoPosts.map((post) => (
              <div
                key={post.id}
                className="aspect-square overflow-hidden rounded-lg"
              >
                <PostCard
                  post={post}
                  userId={userId}
                  compact={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {textPosts.length > 0 && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {textPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                userId={userId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
