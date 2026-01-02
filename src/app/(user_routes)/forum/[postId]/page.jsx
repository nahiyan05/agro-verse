"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import PostHeader from "./components/PostHeader"
import PostContent from "./components/PostContent"
import CommentList from "./components/CommentList"
import FixedCommentBox from "./components/FixedCommentBox"
import EditPostDialog from "./components/EditPostDialog"
import LoadingState from "./components/LoadingState"

export default function PostDetailPage() {
  const params = useParams()
  const postId = params.postId
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  // Edit post state
  const [editPost, setEditPost] = useState({
    title: "",
    content: "",
    flair: ""
  })

  useEffect(() => {
    // Get user from localStorage
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
    
    fetchPost()
    fetchComments()
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/forum/${postId}`)
      const data = await response.json()
      
      if (data.success) {
        setPost(data.post)
      } else {
        toast({
          title: "Error",
          description: "Post not found",
          variant: "destructive",
        })
        // Redirect to forum page
        if (typeof window !== "undefined") {
          window.location.href = '/forum'
        }
      }
    } catch (error) {
      console.error("Error fetching post:", error)
      toast({
        title: "Error",
        description: "Failed to fetch post",
        variant: "destructive",
      })
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/forum/${postId}/comments`)
      const data = await response.json()
      
      if (data.success) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (voteType) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to vote",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/forum/${postId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ vote_type: voteType })
      })

      const data = await response.json()
      
      if (data.success) {
        setPost(prevPost => ({
          ...prevPost,
          votes_count: data.votes_count,
          userVote: data.user_vote
        }))
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to vote",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive",
      })
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to comment",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      })
      return
    }

    if (newComment.length > 500) {
      toast({
        title: "Error",
        description: "Comment is too long (max 500 characters)",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/forum/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newComment.trim() })
      })

      const data = await response.json()
      
      if (data.success) {
        setNewComment("")
        fetchComments() // Refresh comments
        // Update post comment count
        setPost(prevPost => ({
          ...prevPost,
          comments_count: (prevPost.comments_count || 0) + 1
        }))
        toast({
          title: "Success",
          description: "Comment posted successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to post comment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error posting comment:", error)
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    }
  }

  const handleEditPost = () => {
    setEditPost({
      title: post.title,
      content: post.content,
      flair: post.flair || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    
    if (!editPost.title.trim() || !editPost.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/forum/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: editPost.title.trim(),
          content: editPost.content.trim(),
          flair: editPost.flair || null
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setPost(prevPost => ({
          ...prevPost,
          title: data.post.title,
          content: data.post.content,
          flair: data.post.flair,
          updated_at: data.post.updated_at
        }))
        setIsEditDialogOpen(false)
        toast({
          title: "Success",
          description: "Post updated successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update post",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating post:", error)
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      })
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (loading || !post) {
    return <LoadingState />
  }

  return (
    <div className="min-h-screen -mt-8">
      {/* Post Header */}
      <PostHeader 
        post={post}
        user={user}
        formatTimeAgo={formatTimeAgo}
        onEditPost={handleEditPost}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Post Content */}
        <PostContent 
          post={post}
          handleVote={handleVote}
        />

        {/* Comments Section */}
        <div className="mb-32">
          <CommentList 
            comments={comments}
            formatTimeAgo={formatTimeAgo}
          />
        </div>
      </div>

      {/* Fixed Comment Box */}
      <FixedCommentBox 
        user={user}
        newComment={newComment}
        setNewComment={setNewComment}
        handleSubmitComment={handleSubmitComment}
      />

      {/* Edit Post Dialog */}
      <EditPostDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editPost={editPost}
        setEditPost={setEditPost}
        handleSubmitEdit={handleSubmitEdit}
      />
    </div>
  )
}
