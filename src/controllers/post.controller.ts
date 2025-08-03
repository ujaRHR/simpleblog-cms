import { Op } from "sequelize";
import { Post } from "../models/index.ts";
import { User } from "../models/index.ts";
import { mdToHtml } from "../utils/md2Html.ts";

type bodyAttributes = {
  id?: string;
  title?: string;
  slug?: string;
  authorId?: string;
  tags?: string[];
  content?: string;
  htmlContent?: string;
  published?: boolean;
  username?: string;
};

// scaffolding the controllers in 'post' object
export const post: Record<string, any> = {};

post.create = async (ctx: any) => {
  try {
    const { title, slug, tags, content, published } = ctx.request
      .body as bodyAttributes;

    if (!title || !slug || !tags || !content || published === undefined) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Missing required fields!"
      };
      return;
    }

    if (!Array.isArray(tags)) {
      ctx.status = 400;
      ctx.body = { success: false, message: "Tags must be an array." };
      return;
    }

    const htmlContent = await mdToHtml(content);

    await Post.create({
      title,
      slug,
      authorId: ctx.state.user.id,
      tags,
      content,
      htmlContent,
      published
    });

    ctx.status = 201;
    ctx.body = {
      success: true,
      message: "Post created successfully."
    };
  } catch (error: any) {
    const isUnique = error.name === "SequelizeUniqueConstraintError";
    ctx.status = isUnique ? 409 : 500;
    ctx.body = {
      success: false,
      message: isUnique
        ? "You already have a post with this slug. Please choose a different one."
        : "Something went wrong. Please try again later."
    };
  }
};

post.all = async (ctx: any) => {
  try {
    const posts = await Post.findAll({
      where: {
        authorId: ctx.state.user.id
      }
    });

    if (!posts.length) {
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: "There are no posts.",
        posts
      };
      return;
    }

    ctx.body = {
      status: "success",
      message: "Posts retrieved successfully.",
      posts: posts.map((post) => {
        const { authorId, ...raw } = post.toJSON() as any;
        return raw;
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

post.filtered = async (ctx: any) => {
  try {
    const { tag, author, search } = ctx.query;
    const where: any = {};

    if (tag) {
      where.tags = {
        [Op.contains]: [tag]
      };
    }

    if (author) {
      const user = await User.findOne({ where: { username: author } });
      if (!user) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: "There is author with such username."
        };
        return;
      }
      where.authorId = user.id;
    }

    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    const posts = await Post.findAll({
      where,
      include: {
        model: User,
        as: "author",
        attributes: ["id", "username", "fullname"]
      }
    });

    ctx.body = {
      success: true,
      posts: posts.map((p) => {
        const { authorId, ...rest } = p.toJSON();
        return rest;
      })
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong. Please try again later."
    };
  }
};

post.update = async (ctx: any) => {
  try {
    const { slug } = ctx.params as bodyAttributes;
    const updates = ctx.request.body;
    const allowedFields = ["title", "slug", "tags", "content", "published"];

    const filteredUpdates: any = {};

    for (const key of allowedFields) {
      if (key in updates) {
        filteredUpdates[key] = updates[key];

        if (key === "content") {
          const htmlContent = await mdToHtml(updates[key]);
          filteredUpdates["htmlContent"] = htmlContent;
        }
      }
    }

    const post = await Post.findOne({
      where: { slug, authorId: ctx.state.user.id }
    });

    if (!post) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "Post not found or you're not the author."
      };
      return;
    }

    await post.update(filteredUpdates);

    ctx.body = {
      success: true,
      message: "Post updated successfully."
    };
  } catch (error: any) {
    const isUnique = error.name === "SequelizeUniqueConstraintError";
    ctx.status = isUnique ? 409 : 500;
    ctx.body = {
      success: false,
      message: isUnique
        ? "You already have a post with this slug. Please choose a different one."
        : "Something went wrong. Please try again later."
    };
  }
};

post.delete = async (ctx: any) => {
  try {
    const { id } = ctx.params as bodyAttributes;

    const post = await Post.findOne({
      where: { id, authorId: ctx.state.user.id }
    });

    if (!post) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "Post not found or you're not the author."
      };
      return;
    }

    await post.destroy();

    ctx.body = {
      success: true,
      message: "Post deleted successfully."
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong. Please try again later."
    };
  }
};

// To get specific published post using .../username/slug
post.getBySlug = async (ctx: any) => {
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
        message: "There is no such user with this username."
      };
      return;
    }

    const post = await Post.findOne({
      where: {
        slug,
        authorId: user?.id,
        published: true
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "fullname", "username"]
        }
      ]
    });

    if (!post) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "There is no such post with this slug."
      };
      return;
    }

    const { authorId, ...raw } = post.toJSON() as any;
    const { createdAt, updatedAt, ...rest } = raw;

    ctx.body = {
      status: "success",
      message: "Post retrieved successfully.",
      post: {
        ...rest,
        createdAt,
        updatedAt
      }
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

// To get all published posts using .../username
post.getByUsername = async (ctx: any) => {
  try {
    const { username } = ctx.params as bodyAttributes;

    const user = await User.findOne({
      where: {
        username
      }
    });

    if (!user) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "There is no such user with this username."
      };
      return;
    }

    const posts = await Post.findAll({
      where: {
        authorId: user?.id,
        published: true
      }
    });

    if (!posts.length) {
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: "There are no posts for this user.",
        posts
      };
      return;
    }

    ctx.body = {
      status: "success",
      message: "Posts retrieved successfully.",
      posts: posts.map((post) => {
        const { authorId, ...raw } = post.toJSON() as any;
        return raw;
      }),
      author: {
        id: user.id,
        fullname: user.fullname,
        username: user.username
      }
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
