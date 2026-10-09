"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function completeOnboarding(role: "rider" | "driver") {
    const {userId, sessionClaims } = await auth();

    if (!userId) {
        return { error: "Not Authenticated" };
    }

    if (role !== "rider" && role !== "driver") {
        return { error: "Invalid Role"}
    }

    if (sessionClaims?.metadata?.role) {
        return { error: "Role Already Selected & Can't be Changed" }
    }

    try {
        const client = await clerkClient();

        await client.users.updateUserMetadata(userId, {
            publicMetadata: { role, onboardingComplete: true}
        });

        return { success: true as const, role };
    } catch (err) {
        console.error("Failed to save role: ", err);

        return { error: "Could not save your role. Please try again" };
    }
}