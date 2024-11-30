"use client";
import CustomDialogHeader from "@/components/CustomDialogHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CreateCredentailSchema } from "@/schema/credentail";
import { Loader2, ShieldEllipsis } from "lucide-react";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreateCredentail } from "@/actions/credentials/createCredential";

type CreateCredentailDialogProps = {
  triggerText?: string;
};

function CreateCredentialDialog({ triggerText }: CreateCredentailDialogProps) {
  const [open, setOpen] = React.useState(false);

  const form = useForm<CreateCredentailSchema>({
    resolver: zodResolver(CreateCredentailSchema),
    defaultValues: {},
  });

  const { mutate, isPending } = useMutation({
    mutationFn: CreateCredentail,
    onSuccess: () => {
      toast.success("Created credential successfully", {
        id: "create-credentail",
      });
      setOpen(false);
    },
    onError() {
      toast.error("Failed to create credential", {
        id: "create-credentail",
      });
      // TODO: handle error
    },
  });

  const onSubmit = useCallback(
    (values: CreateCredentailSchema) => {
      toast.loading(" Creating credential...", {
        id: "create-credentail",
      });
      mutate(values);
    },
    [mutate]
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        form.reset();
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button>{triggerText ?? "Create"}</Button>
      </DialogTrigger>
      <DialogContent className="px-0">
        <CustomDialogHeader icon={ShieldEllipsis} title="Create credential" />
        <div className="p-6">
          <Form {...form}>
            <form
              className="space-y-8 w-full"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex gap-1 items-center">
                      Name
                      <p className="text-xs text-primary">(required)</p>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a unique a desciptive name for the credential
                      <br />
                      This name will be user to identify the credential
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex gap-1 items-center">
                      Value
                      <p className="text-xs text-primary">(required)</p>
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} className="resize-none" />
                    </FormControl>
                    <FormDescription>
                      Enter the value associated with this credential <br />
                      This value will be securely encrypted and stored in the
                      database
                    </FormDescription>
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit" disabled={isPending}>
                {!isPending && "Proceed"}{" "}
                {isPending && <Loader2 className="animate-spin" />}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateCredentialDialog;
