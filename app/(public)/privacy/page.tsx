import { Privacy } from "@/components/pages/privacy";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos e Condições",
};

export default function PrivacyPage() {
  return <Privacy />;
}
