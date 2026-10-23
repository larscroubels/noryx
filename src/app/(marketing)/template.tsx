/** Re-mounts on every navigation, so each page fades in gently (skipped with reduced motion). */
export default function MarketingTemplate({ children }: { children: React.ReactNode }) {
  return <div className="motion-safe:animate-page-in">{children}</div>;
}
