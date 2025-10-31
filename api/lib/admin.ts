import admin from "firebase-admin";

if (!admin.apps.length) {
  // 讀取 .env 內的 service account JSON
  const serviceAccount = JSON.parse(process.env.firebase_admin_key!);

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
    }),
  });
  
}

export const db = admin.firestore();