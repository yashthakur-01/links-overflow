export type CategoryName =
  | "YouTube"
  | "LinkedIn"
  | "GitHub"
  | "Coding Platforms"
  | "Design"
  | "Documents"
  | "Blogs, Articles & Others"
  | "Instagram"
  | "Discord"
  | "WhatsApp"
  | "No Context Links";

export interface YouTubeMeta {
  title: string;
  channel: string;
  videoId: string;
}

export interface LinkedInMeta {
  identifier: string;
  contentType: string;
}

export interface GitHubMeta {
  username: string;
  repoName: string | null;
  description: string;
}

export interface CodingPlatformMeta {
  platform: string;
  entityName: string;
  type: string;
}

export interface DesignMeta {
  platform: string;
  fileName: string;
}

export interface DocumentMeta {
  title: string;
  fileExtension: string;
}

export interface BlogMeta {
  title: string;
  description: string;
}

export interface SocialMediaMeta {
  identifier: string;
  contentType: string;
}

export interface OtherMeta {
  title: string;
  context: string;
}

export type LinkMeta =
  | YouTubeMeta
  | LinkedInMeta
  | GitHubMeta
  | CodingPlatformMeta
  | DesignMeta
  | DocumentMeta
  | BlogMeta
  | SocialMediaMeta
  | OtherMeta;

export interface LinkItem {
  id: string;
  url: string;
  category: CategoryName;
  subcategory: string;
  meta: LinkMeta;
  favicon: string;
  createdAt: string;
}

export interface FetchLinkResponse {
  success: boolean;
  data?: Omit<LinkItem, "id" | "createdAt">;
  error?: string;
}
