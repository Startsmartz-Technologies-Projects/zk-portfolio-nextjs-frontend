import type { listStories, getStory } from "@/lib/data/news";

export type StoryListItem = Awaited<ReturnType<typeof listStories>>["data"][number];
export type StoryDetail = Awaited<ReturnType<typeof getStory>>;
