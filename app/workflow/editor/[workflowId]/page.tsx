import { waitFor } from "@/lib/helpers/waitFor";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import Editor from "../../_components/Editor";

async function EditorPage({ params }: { params: { workflowId: string } }) {
  const { userId } = auth();
  const { workflowId } = params;

  if (!userId) {
    return <div>Unauthorized</div>;
  }

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
      userId,
    },
  });

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return <Editor workflow={workflow} />;
}

export default EditorPage;
