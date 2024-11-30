"use client";
import { CreateCredentailSchema } from "@/schema/credentail";
import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { DeleteCredential } from "@/actions/credentials/deleteCredentail";

type DeleteCredentailDialogProps = {
  name: string;
};

function DeleteCredentialDialog({ name }: DeleteCredentailDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: DeleteCredential,
    onSuccess: () => {
      toast.success("Deleted credential successfully", {
        id: "delete-credentail",
      });
      setOpen(false);
    },
    onError() {
      toast.error("Failed to delete credential", {
        id: "delete-credentail",
      });
    },
  });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <XIcon size={18} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            If you delete this credentail, you will not be able to recover it.
            <div className="flex fle-col py-4 gap-2">
              <p>
                If you are sure , enter <b>{name}</b> to confirm:
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
            disabled={confirmText !== name || isPending}
            onClick={() => {
              toast.loading("Deleting credentail...", {
                id: "delete-credentail",
              });
              mutate(name);
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

export default DeleteCredentialDialog;
