import { SignIn } from "@clerk/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <SignIn />
    </div>
  );
}