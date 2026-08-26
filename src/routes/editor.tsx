import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { EditorApp } from "@/components/editor/editor-app";

const searchSchema = z.object({
  template: z.string().optional(),
});

export const Route = createFileRoute("/editor")({
  validateSearch: searchSchema,
  component: EditorPage,
});

function EditorPage() {
  const { template } = Route.useSearch();
  return <EditorApp initialTemplate={template} />;
}
