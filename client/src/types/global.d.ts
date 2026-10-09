export {};

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?:"rider" |"driver";
            onboardingComplete?: boolean;
        };
    }
}