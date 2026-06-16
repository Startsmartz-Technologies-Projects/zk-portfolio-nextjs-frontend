import type { listArticles, getArticle } from "@/lib/data/blog";

export type ArticleListItem = Awaited<ReturnType<typeof listArticles>>["data"][number];
export type ArticleDetail = Awaited<ReturnType<typeof getArticle>>;
