import argon2 from "argon2";

/**
 * Tekrise Academy Server Password Hashing Configuration
 * Algorithm: Argon2id (Hybrid data-dependent + data-independent memory hardness)
 * Memory Cost: 65536 KiB (64 MiB per hash)
 * Time Cost: 3 iterations
 * Parallelism: 1 thread
 */
export const ARGON2_OPTIONS: argon2.Options & { raw?: false } = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB RAM required per hash attempt
    timeCost: 3,       // 3 passes over memory
    parallelism: 1,
};

export async function hashPassword(plainPassword: string): Promise<string> {
    // Always trim leading/trailing whitespace before hashing (Task 4 Step 5)
    // Never lowercase passwords so user-chosen casing entropy is preserved
    return argon2.hash(plainPassword.trim(), ARGON2_OPTIONS);
}

export async function verifyPassword(
    storedHash: string,
    candidatePassword: string
): Promise<boolean> {
    try {
        return await argon2.verify(storedHash, candidatePassword.trim());
    } catch {
        return false;
    }
}