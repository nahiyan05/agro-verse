"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";


import CreatePostArea from "./components/CreatePostArea";
import ForumFilters from "./components/ForumFilters";
import PostCard from "./components/PostCard";
import ForumSidebar from "./components/ForumSidebar";

const predefinedFlairs = [
  "Question",
  "Discussion",
  "Tips",
  "News",
  "Problem",
  "Success Story",
  "Help Needed",
  "Market Info",
];

export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [trendingFlairs, setTrendingFlairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("last_activity");
  const [user, setUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMyPostsDialogOpen, setIsMyPostsDialogOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Post form state
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    flair: "",
    customFlair: "",
    images: [],
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }

    fetchPosts();
    fetchTrendingFlairs();
  }, [filterBy, sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      let url = `/api/forum?sortBy=${sortBy}`;

      if (filterBy === "area" && userData.area) {
        url += `&area=${encodeURIComponent(userData.area)}`;
      } else if (filterBy === "city" && userData.city) {
        url += `&city=${encodeURIComponent(userData.city)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch posts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingFlairs = async () => {
    try {
      const response = await fetch("/api/forum/trending-flairs");
      const data = await response.json();

      if (data.success) {
        setTrendingFlairs(data.flairs);
      }
    } catch (error) {
      console.error("Error fetching trending flairs:", error);
    }
  };

  const fetchMyPosts = async () => {
    try {
      const response = await fetch("/api/forum/my-posts");
      const data = await response.json();

      if (data.success) {
        setMyPosts(data.posts);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch your posts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching my posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your posts",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (files.length + newPost.images.length > 5) {
      toast({
        title: "Error",
        description: "Maximum 5 images allowed per post",
        variant: "destructive",
      });
      return;
    }

    setUploadingImages(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));

      const response = await fetch("/api/forum/upload-images", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setNewPost((prev) => ({
          ...prev,
          images: [...prev.images, ...data.images],
        }));
        toast({
          title: "Success",
          description: `${files.length} image(s) uploaded successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to upload images",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setNewPost((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const deletePost = async (postId) => {
    try {
      const response = await fetch(`/api/forum/${postId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Post deleted successfully",
        });
        fetchPosts();
        fetchMyPosts();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to create a post",
        variant: "destructive",
      });
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const finalFlair =
        newPost.flair === "custom" ? newPost.customFlair : newPost.flair;

      const response = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          flair: finalFlair || null,
          area: user.area,
          city: user.city,
          images: newPost.images.length > 0 ? newPost.images : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Post created successfully!",
        });
        setIsDialogOpen(false);
        setNewPost({
          title: "",
          content: "",
          flair: "",
          customFlair: "",
          images: [],
        });
        fetchPosts();
        fetchTrendingFlairs();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (postId, voteType, currentUserVote) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/forum/${postId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vote_type: voteType }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the post in the posts array
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  votes_count: data.votes_count,
                  userVote: data.user_vote,
                }
              : post
          )
        );
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to vote",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            agroverse Forum
          </h1>
        </div>

        {/* Create Post Area */}
        <CreatePostArea
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          newPost={newPost}
          setNewPost={setNewPost}
          handleCreatePost={handleCreatePost}
          predefinedFlairs={predefinedFlairs}
          user={user}
          uploadingImages={uploadingImages}
          handleImageUpload={handleImageUpload}
          removeImage={removeImage}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters and Sort */}
            <ForumFilters
              filterBy={filterBy}
              setFilterBy={setFilterBy}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* Posts List */}
            {loading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-4 w-3/4"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No posts found</p>
                <p className="text-gray-400 dark:text-gray-500">
                  Be the first to create one and start the conversation!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    user={user}
                    handleVote={handleVote}
                    formatTimeAgo={formatTimeAgo}
                    router={router}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ForumSidebar
              user={user}
              isMyPostsDialogOpen={isMyPostsDialogOpen}
              setIsMyPostsDialogOpen={setIsMyPostsDialogOpen}
              fetchMyPosts={fetchMyPosts}
              myPosts={myPosts}
              deletePost={deletePost}
              formatTimeAgo={formatTimeAgo}
              trendingFlairs={trendingFlairs}
              Dialog={Dialog}
              DialogContent={DialogContent}
              DialogHeader={DialogHeader}
              DialogTitle={DialogTitle}
              DialogTrigger={DialogTrigger}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
