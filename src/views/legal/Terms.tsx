import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { termsAndConditions } from "@/content/legal/terms";

export default function TermsPage() {
  return <LegalPageLayout doc={termsAndConditions} />;
}
