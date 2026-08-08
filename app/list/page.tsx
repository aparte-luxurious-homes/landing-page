import type { Metadata } from "next";

import ListRedirect from "@/views/ListRedirect";

export const metadata: Metadata = {
  title: "List your property",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ListRedirect />;
}
