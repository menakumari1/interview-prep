import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

  if (!apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Debug logging
    console.log("Environment Variables Check:", {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      projectId,
      clientEmail,
      privateKeyLength: privateKey?.length,
    });

    if (!projectId || !clientEmail || !privateKey) {
      const missingVars = [
        !projectId && "FIREBASE_PROJECT_ID",
        !clientEmail && "FIREBASE_CLIENT_EMAIL",
        !privateKey && "FIREBASE_PRIVATE_KEY",
      ].filter(Boolean);

      console.error("Missing environment variables:", missingVars);
      throw new Error(
        `Firebase admin initialization failed. Missing: ${missingVars.join(
          ", "
        )}`
      );
    }

    try {
      // Handle the private key formatting
      if (privateKey.includes("\\n")) {
        privateKey = privateKey.replace(/\\n/g, "\n");
      }

      // Remove any extra quotes that might have been added
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }

      const adminConfig = {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      };

      console.log("Initializing Firebase Admin with config:", {
        projectId,
        clientEmail,
        privateKeyLength: privateKey.length,
      });

      initializeApp(adminConfig);
      console.log("Firebase Admin initialized successfully");
    } catch (error: any) {
      console.error("Firebase admin initialization error:", error.message);
      throw error;
    }
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}

export const { auth, db } = initFirebaseAdmin();
