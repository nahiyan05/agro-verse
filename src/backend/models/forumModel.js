import sql from "../config/database.js"

export const forumModel = {
  // Create a new post
  async createPost(postData) {
    const { user_id, title, content, flair, area, city, images } = postData
    const result = await sql`
      INSERT INTO forum_posts (user_id, title, content, flair, area, city, images)
      VALUES (${user_id}, ${title}, ${content}, ${flair}, ${area}, ${city}, ${images || null})
      RETURNING *
    `
    return result[0]
  },

  // Get all posts with filtering options
  async getPosts(filters = {}) {
    const { area, city, sortBy = 'last_activity', limit = 20, offset = 0 } = filters
    
    let orderBy
    switch (sortBy) {
      case 'votes':
        orderBy = 'votes_count DESC, last_activity DESC'
        break
      case 'views':
        orderBy = 'views_count DESC, last_activity DESC'
        break
      case 'comments':
        orderBy = 'comments_count DESC, last_activity DESC'
        break
      default:
        orderBy = 'last_activity DESC'
    }

    let query
    if (area && city) {
      query = sql`
        SELECT 
          p.*,
          u.name as author_name,
          u.profile_pic as author_profile_pic
        FROM forum_posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.area = ${area} AND p.city = ${city}
        ORDER BY ${sql.unsafe(orderBy)}
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (area) {
      query = sql`
        SELECT 
          p.*,
          u.name as author_name,
          u.profile_pic as author_profile_pic
        FROM forum_posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.area = ${area}
        ORDER BY ${sql.unsafe(orderBy)}
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (city) {
      query = sql`
        SELECT 
          p.*,
          u.name as author_name,
          u.profile_pic as author_profile_pic
        FROM forum_posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.city = ${city}
        ORDER BY ${sql.unsafe(orderBy)}
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      query = sql`
        SELECT 
          p.*,
          u.name as author_name,
          u.profile_pic as author_profile_pic
        FROM forum_posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY ${sql.unsafe(orderBy)}
        LIMIT ${limit} OFFSET ${offset}
      `
    }
    
    return await query
  },

  // Get a single post with author info
  async getPostById(postId) {
    const result = await sql`
      SELECT 
        p.*,
        u.name as author_name,
        u.profile_pic as author_profile_pic
      FROM forum_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ${postId}
    `
    return result[0]
  },

  // Update post view count
  async incrementViewCount(postId) {
    const result = await sql`
      UPDATE forum_posts 
      SET views_count = views_count + 1
      WHERE id = ${postId}
      RETURNING views_count
    `
    return result[0]?.views_count
  },

  // Get trending flairs
  async getTrendingFlairs(limit = 10) {
    const result = await sql`
      SELECT flair, COUNT(*) as count
      FROM forum_posts
      WHERE flair IS NOT NULL
      AND created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY flair
      ORDER BY count DESC
      LIMIT ${limit}
    `
    return result
  },

  // Create a comment
  async createComment(commentData) {
    const { post_id, user_id, content } = commentData
    
    // Insert comment
    const comment = await sql`
      INSERT INTO forum_comments (post_id, user_id, content)
      VALUES (${post_id}, ${user_id}, ${content})
      RETURNING *
    `
    
    // Update post comment count and last activity
    await sql`
      UPDATE forum_posts 
      SET comments_count = comments_count + 1,
          last_activity = CURRENT_TIMESTAMP
      WHERE id = ${post_id}
    `
    
    return comment[0]
  },

  // Get comments for a post
  async getCommentsByPostId(postId) {
    const result = await sql`
      SELECT 
        c.*,
        u.name as author_name,
        u.profile_pic as author_profile_pic
      FROM forum_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ${postId}
      ORDER BY c.created_at ASC
    `
    return result
  },

  // Vote on a post with toggle functionality
  async voteOnPost(voteData) {
    const { post_id, user_id, vote_type } = voteData
    
    // Check if user already voted
    const existingVote = await sql`
      SELECT vote_type FROM forum_votes 
      WHERE post_id = ${post_id} AND user_id = ${user_id}
    `
    
    if (existingVote.length > 0) {
      // If same vote type, remove the vote (toggle off)
      if (existingVote[0].vote_type === vote_type) {
        await sql`
          DELETE FROM forum_votes 
          WHERE post_id = ${post_id} AND user_id = ${user_id}
        `
      } else {
        // Different vote type, update the vote
        await sql`
          UPDATE forum_votes 
          SET vote_type = ${vote_type}
          WHERE post_id = ${post_id} AND user_id = ${user_id}
        `
      }
    } else {
      // Create new vote
      await sql`
        INSERT INTO forum_votes (post_id, user_id, vote_type)
        VALUES (${post_id}, ${user_id}, ${vote_type})
      `
    }
    
    // Update post vote count
    const voteSum = await sql`
      SELECT COALESCE(SUM(vote_type), 0) as total_votes
      FROM forum_votes
      WHERE post_id = ${post_id}
    `
    
    await sql`
      UPDATE forum_posts 
      SET votes_count = ${voteSum[0].total_votes}
      WHERE id = ${post_id}
    `
    
    // Return new vote status and count
    const newUserVote = await sql`
      SELECT vote_type FROM forum_votes 
      WHERE post_id = ${post_id} AND user_id = ${user_id}
    `
    
    return { 
      votes_count: voteSum[0].total_votes,
      user_vote: newUserVote[0]?.vote_type || 0
    }
  },

  // Get user's vote for a post
  async getUserVote(postId, userId) {
    const result = await sql`
      SELECT vote_type FROM forum_votes 
      WHERE post_id = ${postId} AND user_id = ${userId}
    `
    return result[0]?.vote_type || 0
  },

  // Get post author for notifications
  async getPostAuthor(postId) {
    const result = await sql`
      SELECT user_id FROM forum_posts WHERE id = ${postId}
    `
    return result[0]?.user_id
  },

  // Update a post (edit)
  async updatePost(postId, userId, updateData) {
    const { title, content, flair } = updateData
    const result = await sql`
      UPDATE forum_posts 
      SET title = ${title}, 
          content = ${content}, 
          flair = ${flair || null}, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${postId} AND user_id = ${userId}
      RETURNING *
    `
    return result[0]
  },

  // Check if user can edit post (is the author)
  async canUserEditPost(postId, userId) {
    const result = await sql`
      SELECT user_id FROM forum_posts WHERE id = ${postId}
    `
    return result[0]?.user_id === userId
  },

  // Get posts by user
  async getPostsByUser(userId, limit = 20, offset = 0) {
    const result = await sql`
      SELECT 
        p.*,
        u.name as author_name,
        u.profile_pic as author_profile_pic
      FROM forum_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ${userId}
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result
  },

  // Delete a post
  async deletePost(postId, userId) {
    // First verify the user owns this post
    const post = await sql`
      SELECT user_id FROM forum_posts WHERE id = ${postId}
    `
    
    if (post.length === 0) {
      throw new Error('Post not found')
    }
    
    if (post[0].user_id !== userId) {
      throw new Error('Unauthorized to delete this post')
    }
    
    // Delete the post (cascade will handle votes and comments)
    const result = await sql`
      DELETE FROM forum_posts WHERE id = ${postId} AND user_id = ${userId}
      RETURNING *
    `
    
    return result[0]
  }
}
