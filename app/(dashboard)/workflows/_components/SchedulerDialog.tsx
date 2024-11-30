"use client";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarIcon, ClockIcon, TriangleAlertIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomDialogHeader from "@/components/CustomDialogHeader";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { UpdateWorkflowCron } from "@/actions/workflows/updateWorkflowCron";
import { toast } from "sonner";
import cronstrue from "cronstrue";
import parser from "cron-parser";
import { removeWorkflowSchedule } from "@/actions/workflows/removeWorkflowSchedule";

function SchedulerDialog(props: { workflowId: string; cron: string | null }) {
  const [cron, setCron] = useState(props.cron || "");
  const [validCron, setValidCron] = useState(false);
  const [readbleCron, setReadableCron] = useState("");

  

  const mutation = useMutation({
    mutationFn: UpdateWorkflowCron,
    onSuccess: () => {
      toast.success("Schedule updated successfully", { id: "cron" });
    },
    onError: () => {
      toast.error("Error updating schedule", { id: "cron" });
    },
  });

  const removeScheduleMutation = useMutation({
    mutationFn: removeWorkflowSchedule,
    onSuccess: () => {
      toast.success("Schedule removed successfully", { id: "cron" });
    },
    onError: () => {
      toast.error("Error updating schedule", { id: "cron" });
    },
  });

  useEffect(() => {
    try {
      parser.parseExpression(cron, { utc: true });
      const humanCronStr = cronstrue.toString(cron);
      setReadableCron(humanCronStr);
      setValidCron(true);
    } catch (e) {
      setValidCron(false);
    }
  }, [cron]);

  const workflowHasValidCron = props.cron && props.cron.length > 0;
  const readableSavedIcon =
    workflowHasValidCron && cronstrue.toString(props.cron!);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          size="sm"
          className={cn(
            "text-sm p-0 h-auto text-orange-500",
            workflowHasValidCron && "text-primary"
          )}
        >
          {workflowHasValidCron && (
            <div className="flex items-center gap-2">
              <ClockIcon />
              {readableSavedIcon}
            </div>
          )}
          {!workflowHasValidCron && (
            <div className="flex items-center gap-1">
              <TriangleAlertIcon className="size-3 mr-1" />
              Set schedule
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="px-0">
        <CustomDialogHeader
          title="Schedule workflow execution"
          icon={CalendarIcon}
        />

        <div className="p-6 space-y-4">
          <p className="text-muted-foreground text-sm">
            Specify a cron expression to schedule periodic workflow execution
            All times are in UTC.
          </p>
          <Input
            placeholder="E.g. * * * * *"
            value={cron}
            onChange={(e) => setCron(e.target.value)}
          />
          <div
            className={cn(
              "bg-accent rounded-md p-4 border text-sm",
              validCron && "border-primary text-primary"
            )}
          >
            {validCron ? readbleCron : "Not a valid cron expression"}
          </div>

          {workflowHasValidCron && (
            <DialogClose asChild>
              <div>
                <Button
                  className="w-full text-destructive border-destructive hover:text-destructive"
                  variant="outline"
                  disabled={
                    mutation.isPending || removeScheduleMutation.isPending
                  }
                  onClick={() => {
                    toast.loading("Removing schedule...", { id: "cron" });
                    removeScheduleMutation.mutate({ id: props.workflowId });
                  }}
                >
                  Remove current schedule
                </Button>
              </div>
            </DialogClose>
          )}
        </div>
        <DialogFooter className="px-6 gap-2">
          <DialogClose asChild>
            <Button className="w-full" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className="w-full"
              disabled={!cron || mutation.isPending || !validCron}
              onClick={() => {
                toast.loading("Saving schedule...", { id: "cron" });
                mutation.mutate({ id: props.workflowId, cron });
              }}
            >
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SchedulerDialog;
