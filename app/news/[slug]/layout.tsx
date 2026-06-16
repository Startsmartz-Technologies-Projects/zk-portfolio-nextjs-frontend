import "../../../src/styles/news.css";
import { BodyClass } from "@/src/components/body-class";

export default function NewsDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BodyClass className="news-page" />
      {children}
    </>
  );
}

