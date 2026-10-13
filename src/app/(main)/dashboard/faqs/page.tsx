import { Metadata } from "next";

import { FaqsPanel } from "../_components/faqs/faqs-panel";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Manage the global mentor FAQ section",
};

export default function FaqsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">FAQs</h1>
        <p className="text-muted-foreground mt-2">
          Global questions shown in the mentor app. Hidden items stay out of the app.
        </p>
      </div>
      <FaqsPanel />
    </div>
  );
}
