import Topbar from "@/app/workflow/_components/topbar/Topbar";
import { auth } from "@clerk/nextjs/server";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import ExecutionViewer from "./_components/ExecutionViewer";
import { GetWorkflowExecutionWithPhases } from "@/actions/workflows/getWorkflowExecutionWithPhases";

export default function ExecutionViewerPage({
  params,
}: {
  params: {
    workflowId: string;
    executionId: string;
  };
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden w-full">
      <Topbar
        workflowId={params.workflowId}
        title="Workflow run details"
        subtitle={`Run ID: ${params.executionId}`}
        hideButtons
      />
      <section className="flex h-full overflow-auto">
        <Suspense
          fallback={
            <div className="flex w-full items-center justify-center">
              <Loader2Icon className="animate-spin size-10 stroke-primary" />
            </div>
          }
        >
          <ExecutionViewerWrapper executionId={params.executionId} />
        </Suspense>
      </section>
    </div>
  );
}

async function ExecutionViewerWrapper({
  executionId,
}: {
  executionId: string;
}) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const workflowExecution = await GetWorkflowExecutionWithPhases(executionId);

  if (!workflowExecution) {
    return <div>Workflow execution not found</div>;
  }

  return <ExecutionViewer initialData={workflowExecution} />;
}
