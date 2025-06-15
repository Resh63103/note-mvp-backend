import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, username: true, createdAt: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "ユーザー取得失敗" });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        body: true,
        imageUrl: true,
        createdAt: true,
        author: { select: { id: true, username: true } },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const postsWithLikeCount = posts.map((post: any) => ({
      ...post,
      likeCount: post.likes.length,
      likes: undefined,
    }));    
    res.json(postsWithLikeCount);
  } catch (error) {
    res.status(500).json({ error: "投稿取得失敗" });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  const postId = Number(req.params.id);
  if (isNaN(postId)) return res.status(400).json({ error: "IDが不正です" });

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        body: true,
        createdAt: true,
        author: { select: { id: true, username: true } },
        likes: true,
      },
    });
    if (!post) return res.status(404).json({ error: "記事が見つかりません" });

    res.json({
      ...post,
      likeCount: post.likes.length,
      likes: undefined,
    });
  } catch (error) {
    res.status(500).json({ error: "記事取得失敗" });
  }
});
/* eslint-enable @typescript-eslint/ban-ts-comment */

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
