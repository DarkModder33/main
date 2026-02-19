import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Task Tool | TradeHax AI",
  description: "Internal task management utility.",
  path: "/todos",
  robots: {
    index: false,
    follow: false,
  },
});

export default function TodosLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
