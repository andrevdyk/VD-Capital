import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  getProfile,
  getProfileStats,
} from "../../actions/users";
import { EditProfileForm } from "../components/EditProfileForm";
import { UserPosts } from "../components/UserPosts";
import { CoverImage } from "../components/CoverImage";
import { AvatarClient } from "../../components/AvatarClient";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { UserVideos } from "../components/UserVideos";
import { UserLive } from "../components/UserLive";
import { UserPlaylists } from "../components/UserPlaylists";
import { FollowButton } from "../components/FollowButton";

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div>
        Please sign in to access this
        page.
      </div>
    );
  }

  const { data: profile, error } =
    await getProfile(params.id);
  const {
    success,
    data: stats,
    error: statsError,
  } = await getProfileStats(params.id);

  if (error || !profile) {
    notFound();
  }

  const isOwnProfile =
    user.id === profile.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CoverImage
          url={
            profile.cover_image_url ||
            undefined
          }
          isEditable={isOwnProfile}
          userId={profile.id}
        />
        <CardContent className="relative">
          <div className="flex items-center justify-between -mt-12">
            <div className="flex items-center space-x-4">
              <AvatarClient
                avatarUrl={
                  profile.avatar_url
                }
                username={
                  profile.username
                }
              />
              <div>
                <h2 className="text-2xl font-semibold">
                  {profile.display_name}
                </h2>
                <p className="text-muted-foreground">
                  @{profile.username}
                </p>
              </div>
            </div>
            {!isOwnProfile && (
              <FollowButton
                followerId={user.id}
                followingId={profile.id}
              />
            )}
          </div>
          {isOwnProfile && (
            <div className="mt-4">
              <EditProfileForm
                profile={profile}
              />
            </div>
          )}
          <div className="mt-4 flex space-x-4">
            <div>
              <span className="font-bold">
                {stats?.posts || 0}
              </span>{" "}
              posts
            </div>
            <div>
              <span className="font-bold">
                {stats?.followers || 0}
              </span>{" "}
              followers
            </div>
            <div>
              <span className="font-bold">
                {stats?.following || 0}
              </span>{" "}
              following
            </div>
          </div>
          {profile.description && (
            <div className="mt-4">
              <p className="text-sm">
                {profile.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs
        defaultValue="home"
        className="mt-6"
      >
        <TabsList className="border-b border-muted bg-transparent">
          <TabsTrigger
            className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground"
            value="home"
          >
            Home
          </TabsTrigger>
          <TabsTrigger
            className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground"
            value="posts"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground"
            value="videos"
          >
            Videos
          </TabsTrigger>
          <TabsTrigger
            className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground"
            value="live"
          >
            Live
          </TabsTrigger>
          <TabsTrigger
            className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground"
            value="playlists"
          >
            Playlists
          </TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="home">
            <h3 className="text-xl font-semibold mb-4">
              Recent Activity
            </h3>
            <UserPosts
              userId={profile.id}
              limit={3}
            />
          </TabsContent>
          <TabsContent value="posts">
            <h3 className="text-xl font-semibold mb-4">
              Posts
            </h3>
            <UserPosts
              userId={profile.id}
            />
          </TabsContent>
          <TabsContent value="videos">
            <h3 className="text-xl font-semibold mb-4">
              Videos
            </h3>
            <UserVideos
              userId={profile.id}
            />
          </TabsContent>
          <TabsContent value="live">
            <h3 className="text-xl font-semibold mb-4">
              Live
            </h3>
            <UserLive
              userId={profile.id}
            />
          </TabsContent>
          <TabsContent value="playlists">
            <h3 className="text-xl font-semibold mb-4">
              Playlists
            </h3>
            <UserPlaylists
              userId={profile.id}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
