import { AdSenseBlock } from "@/components/monetization/AdSenseBlock";
import { RecommendedTools } from "@/components/monetization/AffiliateBanner";
import { getAllBlogPosts } from "@/lib/content/blog-posts";
import { createPageMetadata } from "@/lib/seo";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";

export const metadata = createPageMetadata({
  title: "Blog | Business, Web3, and Service Insights | TradeHax AI",
  description:
    "Read practical articles on digital services, Web3 development, trading systems, and security best practices.",
  path: "/blog",
  imagePath: "/og-blog.svg",
  imageAlt: "TradeHax AI blog previews and guides",
  keywords: [
    "crypto trading",
    "web3",
    "multi-chain",
    "blockchain",
    "defi",
    "trading strategies",
    "tutorials",
    "service business insights",
  ],
});

export default function BlogPage() {
  const blogPosts = getAllBlogPosts();
  const featuredPosts = blogPosts.filter((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-28 md:pb-14">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#00FF41] to-[#39FF14] text-transparent bg-clip-text mb-4">
            Business, Web3, and Service Guides
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Practical articles for clients and builders focused on digital
            growth, Web3 implementation, and secure execution.
          </p>
        </div>

        {/* Ad Placement */}
        <div className="mb-12">
          <AdSenseBlock adSlot="blog-top" adFormat="horizontal" />
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">
              Featured Articles
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredPosts.map((post) => (
                <BlogCard key={post.slug} post={post} featured />
              ))}
            </div>
          </section>
        )}

        {/* Recent Posts */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Posts</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        {/* Sidebar Section with Recommended Tools */}
        <section className="grid gap-6 lg:grid-cols-3 mb-12">
          <div className="lg:col-span-2">
            <AdSenseBlock adSlot="blog-content" adFormat="auto" />
          </div>
          <div className="lg:col-span-1">
            <RecommendedTools />
          </div>
        </section>
      </main>

    </div>
  );
}

interface BlogCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    readTime: number;
    category: string;
  };
  featured?: boolean;
}

function BlogCard({ post, featured = false }: BlogCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`}>
      <article
        className={`group bg-gray-900/50 border border-gray-800 rounded-xl p-5 sm:p-6 hover:border-[#0366d6]/50 transition-all h-full flex flex-col ${featured ? "md:p-8" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 mb-3">
          <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 rounded-full text-[11px] sm:text-xs font-semibold">
            {post.category}
          </span>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Clock className="w-4 h-4" />
            <span>{post.readTime} min</span>
          </div>
        </div>

        <h3
          className={`font-bold text-white mb-3 group-hover:text-[#0366d6] transition-colors ${featured ? "text-2xl" : "text-xl"}`}
        >
          {post.title}
        </h3>

        <p className="text-gray-400 mb-4 flex-grow">{post.excerpt}</p>

        <div className="flex items-center text-[#0366d6] font-semibold group-hover:gap-3 gap-2 transition-all">
          Read More
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </article>
    </Link>
  );
}

