import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { privacyPolicy } from "@/content/legal/privacy";

export default function PrivacyPage() {
  return <LegalPageLayout doc={privacyPolicy} />;
}
