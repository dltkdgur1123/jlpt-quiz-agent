import type { MetadataRoute } from "next";

const siteUrl = "https://jlpt-quiz-agent.vercel.app";
const now = new Date();

const publicRoutes = [
  { path: "/", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/guide", priority: 0.74, changeFrequency: "monthly" as const },
  { path: "/mock-exams/n5", priority: 0.95, changeFrequency: "weekly" as const },
  { path: "/mock-exams/n4", priority: 0.95, changeFrequency: "weekly" as const },
  { path: "/mock-exams/n3", priority: 0.92, changeFrequency: "weekly" as const },
  { path: "/mock-exams/n2", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/mock-exams/n1", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/wrong-note", priority: 0.72, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.48, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.45, changeFrequency: "monthly" as const },
  { path: "/terms", priority: 0.45, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.45, changeFrequency: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
