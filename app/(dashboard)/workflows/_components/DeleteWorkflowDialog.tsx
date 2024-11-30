"use client";

import { DeleteWorkflow } from "@/actions/workflows/deleteWorkflow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  workflowName: string;
  workflowId: string;
};

function DeleteWorkflowDialog({
  open,
  setOpen,
  workflowName,
  workflowId,
}: Props) {
  const [confirmText, setConfirmText] = useState("");

  const deleteMutation = useMutation({
    mutationFn: DeleteWorkflow,
    onSuccess: () => {
      toast.success("Workflow deleted successfully", { id: workflowId });
      setConfirmText("");
    },
    onError: () => {
      toast.error("Something went wrong", { id: workflowId });
      setOpen(false);
    },
  });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        setConfirmText("");
        setOpen(open);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            If you delete this workflow, you will not be able to recover it.
            <div className="flex fle-col py-4 gap-2">
              <p>
                If you are sure , enter <b>{workflowName}</b> to confirm:
              </p>
            </div>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setConfirmText("");
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={confirmText !== workflowName || deleteMutation.isPending}
            onClick={() => {
              toast.loading("Deleting workflow...", { id: workflowId });
              deleteMutation.mutate(workflowId);
            }}
            autoFocus
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteWorkflowDialog;
