import User from "./user.model.ts";
import Post from "./post.model.ts";
import Comment from "./comment.model.ts";

// User model associations
User.hasMany(Post, { foreignKey: "authorId" });

// Post model associations
Post.belongsTo(User, { as: "author", foreignKey: "authorId" });

// Comment model associations
Comment.belongsTo(User, { as: "author", foreignKey: "authorId" });
Comment.belongsTo(Post, { as: "post", foreignKey: "postId" });
Comment.belongsTo(Comment, { as: "parent", foreignKey: "parentId" });
Comment.hasMany(Comment, { as: "replies", foreignKey: "parentId" });

// exportting models
export { User, Post, Comment };
