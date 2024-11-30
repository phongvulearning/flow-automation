import { SetupUser } from "@/actions/biliing/setupUser";
import { waitFor } from "@/lib/helpers/waitFor";

export default async function SetupPage() {
  return await SetupUser();
}
