import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <main className="flex min-h-[clac(100vh-4rem)] items-center justify-center">
            <SignIn />
        </main>
    );
};