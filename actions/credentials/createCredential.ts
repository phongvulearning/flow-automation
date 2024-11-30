"use server";

import { symmetricEncrypt } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { CreateCredentailSchema } from "@/schema/credentail";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function CreateCredentail(form: CreateCredentailSchema) {
  const { success, data } = CreateCredentailSchema.safeParse(form);

  if (!success) {
    throw new Error("Invalid form data");
  }

  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const encryptedValue = symmetricEncrypt(data.value);

  const result = await prisma.credential.create({
    data: {
      userId,
      name: data.name,
      value: encryptedValue,
    },
  });

  if (!result) {
    throw new Error("Failed to create credential");
  }

  revalidatePath("/credentials");
}
