import { redirect } from "next/navigation";

export default function BlankServerRedirect() {
  return redirect("/");
}
