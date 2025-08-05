-- PostgreSQL database structure

DROP TABLE IF EXISTS "users";
CREATE TABLE "public"."users" (
    "id" uuid NOT NULL,
    "fullname" character varying(100) NOT NULL,
    "email" character varying(100) NOT NULL,
    "username" character varying(30) NOT NULL,
    "password" character varying(255) NOT NULL,
    "role" enum_users_role DEFAULT 'user' NOT NULL,
    "is_verified" boolean DEFAULT false NOT NULL,
    "email_verify_token" character varying(255),
    "last_login" timestamptz,
    "password_reset_token" character varying(255),
    "password_reset_expires" timestamptz,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


DROP TABLE IF EXISTS "posts";
CREATE TABLE "public"."posts" (
    "id" uuid NOT NULL,
    "title" character varying(255) NOT NULL,
    "slug" character varying(255) NOT NULL,
    "author_id" uuid NOT NULL,
    "tags" character varying(255)[] NOT NULL,
    "content" text NOT NULL,
    "html_content" text NOT NULL,
    "published" boolean DEFAULT false,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX posts_slug_author_id ON public.posts USING btree (slug, author_id);


DROP TABLE IF EXISTS "comments";
CREATE TABLE "public"."comments" (
    "id" uuid NOT NULL,
    "content" character varying(999) NOT NULL,
    "author_id" uuid NOT NULL,
    "post_id" uuid NOT NULL,
    "parent_id" uuid,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);


ALTER TABLE ONLY "public"."comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES comments(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
