import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

type CliOptions = {
  apply: boolean;
  dropSource: boolean;
  migrateCredentialAccounts: boolean;
};

function parseCliOptions(args: string[]): CliOptions {
  return {
    apply: args.includes("--apply"),
    dropSource: args.includes("--drop-source"),
    migrateCredentialAccounts: args.includes("--migrate-credential-accounts"),
  };
}

type LegacyUser = {
  _id: ObjectId;
  email?: string;
  name?: string;
  passwordHash?: string;
  pfp?: string;
  age?: number;
  birth?: string;
  weight?: number;
  height?: number;
  bio?: string;
  dietary_restric?: string[];
  allergies?: string[];
  skill_level?: "beginner" | "intermediate" | "advanced" | "expert";
  cuisines_pref?: string[];
  isCustomized?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type BetterAuthUserDoc = {
  _id: ObjectId;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeEmail(email?: string): string | null {
  if (!email) {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function toIsoDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

async function run(): Promise<void> {
  const { apply, dropSource, migrateCredentialAccounts } = parseCliOptions(
    process.argv.slice(2)
  );

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required.");
  }

  const sourceName = process.env.BETTER_AUTH_OLD_USER_MODEL_NAME || "users";
  const targetName = process.env.BETTER_AUTH_USER_MODEL_NAME || "googleusers";
  const profileName = process.env.PROFILE_MODEL_NAME || "profiles";
  const accountName = process.env.BETTER_AUTH_ACCOUNT_MODEL_NAME || "account";

  if (sourceName === targetName) {
    console.log(`No-op: source and target are both "${sourceName}".`);
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collections = await db.listCollections().toArray();
    const collectionNames = new Set(collections.map((collection) => collection.name));

    const sourceExists = collectionNames.has(sourceName);
    const targetExists = collectionNames.has(targetName);

    if (!sourceExists) {
      console.log(`No-op: source collection "${sourceName}" does not exist.`);
      return;
    }

    const sourceCollection = db.collection<LegacyUser>(sourceName);
    const targetCollection = db.collection<BetterAuthUserDoc>(targetName);
    const profileCollection = db.collection(profileName);
    const accountCollection = db.collection(accountName);

    if (!targetExists && apply) {
      await db.createCollection(targetName);
    }

    const sourceCount = await sourceCollection.countDocuments();
    const targetCount = targetExists ? await targetCollection.countDocuments() : 0;
    const profileCount = collectionNames.has(profileName)
      ? await profileCollection.countDocuments()
      : 0;

    console.log(
      `Source "${sourceName}"=${sourceCount}, target "${targetName}"=${targetCount}, "${profileName}"=${profileCount}.`
    );

    let scanned = 0;
    let skippedNoEmail = 0;
    let mergedIntoExisting = 0;
    let createdBetterAuthUsers = 0;
    let createdProfiles = 0;
    let linkedProfiles = 0;
    let createdCredentialAccounts = 0;
    let skippedDuplicateCredentialAccounts = 0;

    const dryRunNotes: string[] = [];

    for await (const legacyUser of sourceCollection.find({})) {
      scanned += 1;
      const email = normalizeEmail(legacyUser.email);

      if (!email) {
        skippedNoEmail += 1;
        continue;
      }

      let betterAuthUser = await targetCollection.findOne({ email });
      const betterAuthUserId = (betterAuthUser?._id ?? legacyUser._id).toHexString();

      if (!betterAuthUser) {
        const newDoc: BetterAuthUserDoc = {
          _id: legacyUser._id,
          email,
          name: legacyUser.name?.trim() || "User",
          emailVerified: true,
          image: legacyUser.pfp,
          createdAt: toIsoDate(legacyUser.createdAt),
          updatedAt: toIsoDate(legacyUser.updatedAt),
        };

        if (apply) {
          await targetCollection.insertOne(newDoc);
        } else {
          dryRunNotes.push(`[dry-run] Would create Better Auth user for ${email}`);
        }

        betterAuthUser = newDoc;
        createdBetterAuthUsers += 1;
      } else {
        mergedIntoExisting += 1;
      }

      const profileByAuthUserId = await profileCollection.findOne({
        authUserId: betterAuthUserId,
      });
      const profileByLegacyId = await profileCollection.findOne({
        legacyUserId: legacyUser._id,
      });
      const profileByEmail = await profileCollection.findOne({ email });

      const selectedProfile = profileByAuthUserId || profileByLegacyId || profileByEmail;

      if (!selectedProfile) {
        const profileDoc = {
          authUserId: betterAuthUserId,
          email,
          name: legacyUser.name?.trim() || betterAuthUser.name || "User",
          pfp: legacyUser.pfp ?? betterAuthUser.image,
          age: legacyUser.age,
          birth: legacyUser.birth,
          weight: legacyUser.weight,
          height: legacyUser.height,
          bio: legacyUser.bio,
          dietary_restric: legacyUser.dietary_restric ?? [],
          allergies: legacyUser.allergies ?? [],
          skill_level: legacyUser.skill_level,
          cuisines_pref: legacyUser.cuisines_pref ?? [],
          isCustomized: legacyUser.isCustomized ?? false,
          legacyUserId: legacyUser._id,
          createdAt: toIsoDate(legacyUser.createdAt),
          updatedAt: new Date(),
        };

        if (apply) {
          await profileCollection.insertOne(profileDoc);
        } else {
          dryRunNotes.push(`[dry-run] Would create profile for ${email}`);
        }

        createdProfiles += 1;
      } else if (
        selectedProfile.authUserId !== betterAuthUserId ||
        !selectedProfile.legacyUserId
      ) {
        const updates: Record<string, unknown> = {
          authUserId: betterAuthUserId,
          email,
          name: selectedProfile.name || legacyUser.name || betterAuthUser.name || "User",
          updatedAt: new Date(),
        };

        if (!selectedProfile.legacyUserId) {
          updates.legacyUserId = legacyUser._id;
        }

        if (apply) {
          await profileCollection.updateOne(
            { _id: selectedProfile._id },
            { $set: updates }
          );
        } else {
          dryRunNotes.push(`[dry-run] Would relink profile for ${email}`);
        }

        linkedProfiles += 1;
      }

      if (migrateCredentialAccounts) {
        const existingCredential = await accountCollection.findOne({
          userId: betterAuthUserId,
          providerId: "credential",
        });

        if (existingCredential) {
          skippedDuplicateCredentialAccounts += 1;
        } else if (legacyUser.passwordHash) {
          const accountDoc = {
            _id: new ObjectId().toHexString(),
            accountId: betterAuthUserId,
            providerId: "credential",
            userId: betterAuthUserId,
            password: legacyUser.passwordHash,
            createdAt: toIsoDate(legacyUser.createdAt),
            updatedAt: new Date(),
          };

          if (apply) {
            await accountCollection.insertOne(accountDoc);
          } else {
            dryRunNotes.push(
              `[dry-run] Would create credential account for ${email} (hash copied as-is)`
            );
          }

          createdCredentialAccounts += 1;
        }
      }
    }

    if (!apply) {
      console.log("Dry-run summary:");
      console.log(`- scanned: ${scanned}`);
      console.log(`- skippedNoEmail: ${skippedNoEmail}`);
      console.log(`- createdBetterAuthUsers: ${createdBetterAuthUsers}`);
      console.log(`- mergedIntoExisting: ${mergedIntoExisting}`);
      console.log(`- createdProfiles: ${createdProfiles}`);
      console.log(`- linkedProfiles: ${linkedProfiles}`);
      console.log(`- createdCredentialAccounts: ${createdCredentialAccounts}`);
      console.log(
        `- skippedDuplicateCredentialAccounts: ${skippedDuplicateCredentialAccounts}`
      );

      if (migrateCredentialAccounts) {
        console.log(
          "Warning: credential account migration copies legacy bcrypt hashes as-is. Verify Better Auth password verification compatibility before cutover."
        );
      }

      for (const note of dryRunNotes.slice(0, 30)) {
        console.log(note);
      }

      if (dryRunNotes.length > 30) {
        console.log(`[dry-run] ... ${dryRunNotes.length - 30} more actions omitted`);
      }

      return;
    }

    console.log("Applied migration summary:");
    console.log(`- scanned: ${scanned}`);
    console.log(`- skippedNoEmail: ${skippedNoEmail}`);
    console.log(`- createdBetterAuthUsers: ${createdBetterAuthUsers}`);
    console.log(`- mergedIntoExisting: ${mergedIntoExisting}`);
    console.log(`- createdProfiles: ${createdProfiles}`);
    console.log(`- linkedProfiles: ${linkedProfiles}`);
    console.log(`- createdCredentialAccounts: ${createdCredentialAccounts}`);
    console.log(
      `- skippedDuplicateCredentialAccounts: ${skippedDuplicateCredentialAccounts}`
    );

    if (dropSource) {
      await sourceCollection.drop();
      console.log(`Dropped source collection "${sourceName}".`);
    } else {
      console.log(
        `Source collection "${sourceName}" kept. Re-run with --drop-source to remove it.`
      );
    }
  } finally {
    await client.close();
  }
}

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
