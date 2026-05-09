import "../../src/styles/news.css";
import "../../src/styles/blog.css";
import "../../src/styles/concern.css";
import { BodyClass } from "@/src/components/body-class";

export default function ConcernDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BodyClass className="concern-page" />
      {children}
    </>
  );
}
