import { Op } from "sequelize";
import { Post, User, Comment } from "../models/index.ts";

type bodyAttributes = {
  id?: string;
  slug?: string;
  username?: string;
  content?: string;
  authorId?: string;
  postId?: string;
  parentId?: string | null;
};

// scaffolding the controllers in 'comment' object
export const comment: Record<string, any> = {};

comment.create = async (ctx: any) => {
  try {
    const { content, postId, parentId } = ctx.request.body as bodyAttributes;

    if (!content || !postId) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Missing required fields!"
      };
      return;
    }

    const post = await Post.findByPk(postId);

    if (!post) {
      (ctx.status = 404),
        (ctx.body = {
          success: false,
          message: "There is no such post"
        });
      return;
    }

    await Comment.create({
      content,
      authorId: ctx.state.user.id,
      postId,
      ...(parentId && { parentId })
    });

    ctx.status = 201;
    ctx.body = {
      success: true,
      message: "Comment posted successfully."
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong. Please try again later.",
      reason: error
    };
  }
};

comment.delete = async (ctx: any) => {
  try {
    const { id } = ctx.params as bodyAttributes;

    const comment = await Comment.findOne({
      where: {
        id,
        authorId: ctx.state.user.id
      }
    });

    if (!comment) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "Comment not found or you're not the author."
      };
      return;
    }

    await comment.destroy();

    ctx.body = {
      success: true,
      message: "Comment deleted successfully."
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong. Please try again later."
    };
  }
};

comment.getByPostSlug = async (ctx: any) => {
  try {
    const { username, slug } = ctx.params as bodyAttributes;

    const user = await User.findOne({
      where: {
        username
      }
    });

    if (!user) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "There is no user with this username"
      };
      return;
    }

    const post = await Post.findOne({
      where: {
        slug,
        authorId: user.id,
        published: true
      }
    });

    if (!post) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "There is no such post with this slug."
      };
      return;
    }

    const comments = await Comment.findAll({
      where: { postId: post.id, parentId: null },
      include: [
        {
          model: Comment,
          as: "replies",
          attributes: ["id", "content", "parentId"],
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "username", "fullname"]
            }
          ]
        },
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "fullname"]
        }
      ],
      order: [["createdAt", "ASC"]]
    });

    ctx.body = {
      success: true,
      message: "Comments retrieved successfully.",
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug
      },
      comments: comments.map((comment) => {
        const { authorId, postId, ...rest } = comment.toJSON();
        return rest;
      })
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong!",
      reason: error.message
    };
  }
};
