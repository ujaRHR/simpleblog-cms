import User from "./user.model.ts";
import Post from "./post.model.ts";

// Model associations
User.hasMany(Post, { foreignKey: "authorId" });
Post.belongsTo(User, { as: "author", foreignKey: "authorId" });

// exportting models
export { User, Post };
