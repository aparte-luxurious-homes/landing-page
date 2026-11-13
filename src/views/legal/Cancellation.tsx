import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { cancellationPolicy } from "@/content/legal/cancellation";

export default function CancellationPage() {
  return <LegalPageLayout doc={cancellationPolicy} />;
}
