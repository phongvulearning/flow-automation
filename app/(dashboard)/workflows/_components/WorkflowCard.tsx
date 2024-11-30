"use client";

import React, { useState } from "react";
import { Workflow } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ChevronRightIcon,
  ClockIcon,
  CoinsIcon,
  CornerRightDownIcon,
  FileTextIcon,
  MoreVerticalIcon,
  MoveRightIcon,
  PlayIcon,
  ShuffleIcon,
  TrashIcon,
} from "lucide-react";
import { WorkflowExecutionStatus, WorkflowStatus } from "@/types/workflow";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TooltipWrapper from "@/components/TooltipWrapper";
import DeleteWorkflowDialog from "./DeleteWorkflowDialog";
import RunButton from "@/app/workflow/_components/RunButton";
import SchedulerDialog from "./SchedulerDialog";
import { Badge } from "@/components/ui/badge";
import ExecutionStatusIndicator, {
  ExecutionStatusLabel,
} from "@/app/workflow/runs/[workflowId]/_components/ExecutionStatusIndicator";
import { format, formatDistanceToNow } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import DuplicateWorkflowDialog from "./DuplicateWorkflowDialog";

type Props = {
  workflow: Workflow;
};

const statusColorMap: Record<WorkflowStatus, string> = {
  [WorkflowStatus.DRAFT]: "bg-orange-400 text-white",
  [WorkflowStatus.PUBLISHED]: "bg-primary text-white",
};

const WorkflowCard = ({ workflow }: Props) => {
  const isDraft = workflow.status === "DRAFT";

  return (
    <Card className="border border-separate shadow-sm rounded-lg overflow-hidden hover:shadow-md dark:shadow-primary/30 group/card">
      <CardContent className="p-4 flex items-center justify-between h-[100px]">
        <div className="flex items-center justify-end space-x-3">
          <div
            className={cn(
              "size-10 rounded-full flex items-center justify-center",
              statusColorMap[workflow.status as WorkflowStatus]
            )}
          >
            {isDraft ? (
              <FileTextIcon className="size-5" />
            ) : (
              <PlayIcon className="size-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-muted-foreground flex items-center">
              <TooltipWrapper content={workflow.description}>
                <Link
                  className="flex items-center hover:underline"
                  href={`/workflow/editor/${workflow.id}`}
                >
                  {workflow.name}
                </Link>
              </TooltipWrapper>
              {isDraft && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-800 rounded-full">
                  Draft
                </span>
              )}
              <DuplicateWorkflowDialog workflowId={workflow.id} />
            </h3>
            <SchedulerSection
              cron={workflow.cron}
              isDraft={isDraft}
              workflowId={workflow.id}
              creditsCost={workflow.creditsCost}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isDraft && <RunButton workflowId={workflow.id} />}
          <Link
            href={`/workflow/editor/${workflow.id}`}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "sm",
              }),
              "flex items-center gap-2"
            )}
          >
            <ShuffleIcon size={16} />
            Edit
          </Link>
          <WorkflowActions
            workflowId={workflow.id}
            workflowName={workflow.name}
          />
        </div>
      </CardContent>
      <LastRunDetails workflow={workflow} />
    </Card>
  );
};

function WorkflowActions({
  workflowName,
  workflowId,
}: {
  workflowName: string;
  workflowId: string;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DeleteWorkflowDialog
        workflowId={workflowId}
        open={showDeleteDialog}
        workflowName={workflowName}
        setOpen={setShowDeleteDialog}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <TooltipWrapper content="More actions">
              <div className="flex items-center justify-center size-full">
                <MoreVerticalIcon size={18} />
              </div>
            </TooltipWrapper>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive flex items-center gap-2"
            onClick={() => setShowDeleteDialog((open) => !open)}
          >
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function SchedulerSection({
  isDraft,
  creditsCost,
  workflowId,
  cron,
}: {
  isDraft: boolean;
  creditsCost: number;
  workflowId: string;
  cron: string | null;
}) {
  if (isDraft) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <CornerRightDownIcon className="size-4 text-muted-foreground" />
      <SchedulerDialog
        workflowId={workflowId}
        cron={cron}
        key={`${cron}-${workflowId}`}
      />
      <MoveRightIcon className="size-4 text-muted-foreground" />
      <TooltipWrapper content="Credits consumption for full run">
        <div className=" flex items-center gap-3">
          <Badge
            variant="outline"
            className="space-x-2 text-muted-foreground rounded-sm"
          >
            <CoinsIcon size={16} />
            <span className="text-sm">{creditsCost}</span>
          </Badge>
        </div>
      </TooltipWrapper>
    </div>
  );
}

function LastRunDetails({ workflow }: { workflow: Workflow }) {
  const isDraft = workflow.status === WorkflowStatus.DRAFT;

  if (isDraft) return null;

  const { lastRunAt, lastRunStatus, lastRunId, nextRunAt } = workflow;

  const formattedStartedAt =
    lastRunAt &&
    formatDistanceToNow(lastRunAt, {
      addSuffix: true,
    });

  const nextSchedule = nextRunAt && format(nextRunAt, "yyyy-MM-dd HH:mm");
  const nextScheduleUTC =
    nextRunAt && formatInTimeZone(nextRunAt, "UTC", "HH:mm");

  return (
    <div className="bg-primary/5 px-4 py-1 flex justify-between items-center text-muted-foreground">
      <div className="flex items-center gap-2 text-sm">
        {lastRunAt && (
          <Link
            href={`/workflow/runs/${workflow.id}/${lastRunId}`}
            className="flex items-center text-sm gap-2 group"
          >
            <span>Last run:</span>
            <ExecutionStatusIndicator
              status={lastRunStatus as WorkflowExecutionStatus}
            />
            <ExecutionStatusLabel
              status={lastRunStatus as WorkflowExecutionStatus}
            />
            <span>{lastRunStatus}</span>
            <span>{formattedStartedAt}</span>
            <ChevronRightIcon
              size={14}
              className="group-hover:translate-x-0 transition-all -translate-x-[2px]"
            />
          </Link>
        )}
        {!lastRunAt && <p>No runs yet</p>}
      </div>
      {nextRunAt && (
        <div className="flex items-center gap-2 text-sm">
          <ClockIcon size={12} />
          <span>Next run at:</span>
          <span>{nextSchedule}</span>
          <span className="text-xs">({nextScheduleUTC} UTC)</span>
        </div>
      )}
    </div>
  );
}

export default WorkflowCard;
