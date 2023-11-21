import CreateNameForm from "./CreateNameForm";
import SignUpForm from "./SignUpForm";

interface Props {
  authStatus: "unauthenticated" | "signingUp";
}

export default function FormWrapper({ authStatus }: Props) {
  return authStatus === "unauthenticated" ? <SignUpForm /> : <CreateNameForm />;
}
