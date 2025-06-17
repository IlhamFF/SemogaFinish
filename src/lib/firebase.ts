
// import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
// import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
// import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
// };

// let app: FirebaseApp;
// let auth: Auth;
// let analytics: Analytics | undefined;

// if (typeof window !== "undefined" && !getApps().length) {
//   app = initializeApp(firebaseConfig);
//   auth = getAuth(app);

//   if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST) {
//     const authHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "http://127.0.0.1:9099";
//     connectAuthEmulator(auth, authHost, { disableWarnings: true });
//     console.log(`Firebase Auth Emulator connected to: ${authHost}`);
//   }

//   isSupported().then((supported) => {
//     if (supported) {
//       analytics = getAnalytics(app);
//       console.log("Firebase Analytics initialized.");
//     } else {
//       console.log("Firebase Analytics is not supported in this environment.");
//     }
//   });
// } else if (getApps().length > 0) {
//   app = getApp();
//   auth = getAuth(app);
//   if (typeof window !== "undefined") {
//     isSupported().then((supported) => {
//       if (supported && !analytics) { // Initialize analytics only if not already initialized
//         analytics = getAnalytics(app);
//       }
//     });
//   }
// } else {
//   // Server-side or environment without window
//   // Avoid initializing client-side Firebase services here
//   // You might initialize Firebase Admin SDK separately for server-side operations
// }

// // Exporting undefined for server-side where client SDKs are not initialized
// // or for environments where they're not supported/needed.
// export { app as firebaseApp, auth as firebaseAuth, analytics as firebaseAnalytics };

// This file is no longer primarily used for Firebase Authentication client setup.
// If other Firebase services (Firestore, Storage) are needed, they can be initialized here.
// For now, keeping it minimal or empty.
