import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <main className="flex min-h-[clac(100vh-4rem)] items-center justify-center">
            <SignUp />
        </main>
    );
};