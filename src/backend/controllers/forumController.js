import { forumModel } from "../models/forumModel.js"
import { notificationController } from "./notificationController.js"

export const forumController = {
  // Create a new post
  async createPost(req, res) {
    try {
      const { title, content, flair, area, city } = req.body
      const user_id = req.user?.id

      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "User authentication required"
        })
      }

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: "Title and content are required"
        })
      }

      const post = await forumModel.createPost({
        user_id,
        title,
        content,
        flair: flair || null,
        area: area || null,
        city: city || null
      })

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        post
      })
    } catch (error) {
      console.error("Create post error:", error)
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Get posts with filtering
  async getPosts(req, res) {
    try {
      let area, city, sortBy = 'last_activity', limit = 20, offset = 0
      
      if (req.query) {
        // Traditional Node.js req/res
        area = req.query.area
        city = req.query.city
        sortBy = req.query.sortBy || 'last_activity'
        limit = parseInt(req.query.limit || 20)
        offset = parseInt(req.query.offset || 0)
      } else if (req.url) {
        // Next.js API routes
        const url = new URL(req.url, 'http://localhost')
        area = url.searchParams.get('area')
        city = url.searchParams.get('city')
        sortBy = url.searchParams.get('sortBy') || 'last_activity'
        limit = parseInt(url.searchParams.get('limit') || '20')
        offset = parseInt(url.searchParams.get('offset') || '0')
      }

      const posts = await forumModel.getPosts({
        area,
        city,
        sortBy,
        limit,
        offset
      })

      if (res.json) {
        return res.json({
          success: true,
          posts
        })
      } else {
        // For Next.js API routes
        return Response.json({
          success: true,
          posts
        })
      }
    } catch (error) {
      console.error("Get posts error:", error)
      if (res.status) {
        return res.status(500).json({
          success: false,
          message: error.message
        })
      } else {
        return Response.json({
          success: false,
          message: error.message
        }, { status: 500 })
      }
    }
  },

  // Get a single post
  async getPost(req, res) {
    try {
      const { postId } = req.params
      const user_id = req.user?.id

      const post = await forumModel.getPostById(postId)
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found"
        })
      }

      // Increment view count (but not if it's the author viewing)
      if (user_id !== post.user_id) {
        await forumModel.incrementViewCount(postId)
        post.views_count += 1
      }

      // Get user's vote if authenticated
      let userVote = 0
      if (user_id) {
        userVote = await forumModel.getUserVote(postId, user_id)
      }

      res.json({
        success: true,
        post: {
          ...post,
          userVote
        }
      })
    } catch (error) {
      console.error("Get post error:", error)
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Get trending flairs
  async getTrendingFlairs(req, res) {
    try {
      const flairs = await forumModel.getTrendingFlairs()
      res.json({
        success: true,
        flairs
      })
    } catch (error) {
      console.error("Get trending flairs error:", error)
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Create a comment
  async createComment(req, res) {
    try {
      const { postId } = req.params
      const { content } = req.body
      const user_id = req.user?.id

      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "User authentication required"
        })
      }

      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Comment content is required"
        })
      }

      const comment = await forumModel.createComment({
        post_id: postId,
        user_id,
        content
      })

      // Send notification to post author (if not commenting on own post)
      const postAuthorId = await forumModel.getPostAuthor(postId)
      if (postAuthorId && postAuthorId !== user_id) {
        await notificationController.createNotificationForUser(
          postAuthorId,
          'forum_comment',
          'Someone commented on your forum post'
        )
      }

      res.status(201).json({
        success: true,
        message: "Comment created successfully",
        comment
      })
    } catch (error) {
      console.error("Create comment error:", error)
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Get comments for a post
  async getComments(req, res) {
    try {
      const { postId } = req.params
      const comments = await forumModel.getCommentsByPostId(postId)

      res.json({
        success: true,
        comments
      })
    } catch (error) {
      console.error("Get comments error:", error)
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Vote on a post
  async voteOnPost(req, res) {
    try {
      const { postId } = req.params
      const { vote_type } = req.body // 1 for upvote, -1 for downvote
      const user_id = req.user?.id

      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "User authentication required"
        })
      }

      if (![1, -1].includes(vote_type)) {
        return res.status(400).json({
          success: false,
          message: "Vote type must be 1 (upvote) or -1 (downvote)"
        })
      }

      const result = await forumModel.voteOnPost({
        post_id: postId,
        user_id,
        vote_type
      })

      res.json({
        success: true,
        message: "Vote recorded successfully",
        votes_count: result.votes_count
      })
    } catch (error) {
      console.error("Vote on post error:", error)
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}
