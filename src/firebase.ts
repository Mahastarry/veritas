import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  initializeFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  limit 
} from "firebase/firestore";
import { LegalCase } from "./mock_cases";

export interface UserProfile {
  plan: "free" | "pro";
  subscriptionStatus: "inactive" | "active" | "expired";
  subscriptionStart: string | null;
  subscriptionExpiry: string | null;
  monthlyCaseCount: number;
  monthlyUsagePeriod: string;
  isPro?: boolean;
}

// Use the credentials from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyBeOltcImOibw-8jIMlSAfPg-rM3r8aZPs",
  authDomain: "veritas-e90a5.firebaseapp.com",
  projectId: "veritas-e90a5",
  storageBucket: "veritas-e90a5.firebasestorage.app",
  messagingSenderId: "889570649585",
  appId: "1:889570649585:web:d0820b532939f9fc65d050"
};

// 1. Initialize Firebase
export const app = initializeApp(firebaseConfig);

// 2. Initialize Firestore with custom databaseId if configured
export const db = initializeFirestore(app, {}, "ai-studio-6ebbf83d-57a9-4e90-8150-1842f34a30e9");

// 3. Initialize Auth
export const auth = getAuth(app);

// Error tracking as required by the firebase-integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Info:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Encapsulated Auth and Cases database operations
export const firebaseService = {
  getCurrentMonthlyPeriod(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  },

  async getOrInitializeUserProfile(userId: string): Promise<UserProfile> {
    const currentPeriod = this.getCurrentMonthlyPeriod();
    const defaultProfile: UserProfile = {
      plan: "free",
      subscriptionStatus: "inactive",
      subscriptionStart: null,
      subscriptionExpiry: null,
      monthlyCaseCount: 0,
      monthlyUsagePeriod: currentPeriod
    };

    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      let profile: UserProfile;

      if (docSnap.exists()) {
        const data = docSnap.data();
        const plan = data.plan || (data.isPro ? "pro" : "free");
        profile = {
          plan: plan,
          subscriptionStatus: data.subscriptionStatus || (plan === "pro" ? "active" : "inactive"),
          subscriptionStart: data.subscriptionStart || null,
          subscriptionExpiry: data.subscriptionExpiry || null,
          monthlyCaseCount: typeof data.monthlyCaseCount === "number" ? data.monthlyCaseCount : 0,
          monthlyUsagePeriod: data.monthlyUsagePeriod || currentPeriod
        };
      } else {
        profile = { ...defaultProfile };
      }

      // Check for subscription expiry
      let updated = false;
      const nowStr = new Date().toISOString();
      if (profile.plan === "pro" && profile.subscriptionExpiry) {
        if (nowStr > profile.subscriptionExpiry) {
          profile.plan = "free";
          profile.subscriptionStatus = "expired";
          updated = true;
        }
      }

      // Monthly usage period reset check
      if (profile.monthlyUsagePeriod !== currentPeriod) {
        profile.monthlyCaseCount = 0;
        profile.monthlyUsagePeriod = currentPeriod;
        updated = true;
      }

      if (updated || !docSnap.exists()) {
        const docRef = doc(db, "users", userId);
        await setDoc(docRef, profile, { merge: true });
      }

      // Save locally
      localStorage.setItem(`veritas_profile_${userId}`, JSON.stringify(profile));
      return profile;
    } catch (e: any) {
      console.warn("Could not retrieve/update user profile from Cloud. Using local fallback.", e);
      if (e?.code === "permission-denied" || e?.message?.includes("permissions")) {
        handleFirestoreError(e, OperationType.GET, `users/${userId}`);
      }
    }

    // Local storage fallback
    try {
      const stored = localStorage.getItem(`veritas_profile_${userId}`);
      if (stored) {
        const profile = JSON.parse(stored) as UserProfile;
        let updated = false;
        const nowStr = new Date().toISOString();
        if (profile.plan === "pro" && profile.subscriptionExpiry) {
          if (nowStr > profile.subscriptionExpiry) {
            profile.plan = "free";
            profile.subscriptionStatus = "expired";
            updated = true;
          }
        }
        if (profile.monthlyUsagePeriod !== currentPeriod) {
          profile.monthlyCaseCount = 0;
          profile.monthlyUsagePeriod = currentPeriod;
          updated = true;
        }
        if (updated) {
          localStorage.setItem(`veritas_profile_${userId}`, JSON.stringify(profile));
        }
        return profile;
      }
    } catch (e) {}

    return defaultProfile;
  },

  async getUserProfile(userId: string): Promise<UserProfile & { isPro: boolean }> {
    const profile = await this.getOrInitializeUserProfile(userId);
    return {
      ...profile,
      isPro: profile.plan === "pro"
    };
  },

  async updateUserProfile(userId: string, fields: Partial<UserProfile> & { isPro?: boolean }): Promise<void> {
    try {
      const docRef = doc(db, "users", userId);
      const current = await this.getOrInitializeUserProfile(userId);
      const merged = { ...current, ...fields };
      
      if (fields.isPro !== undefined) {
        merged.plan = fields.isPro ? "pro" : "free";
        merged.subscriptionStatus = fields.isPro ? "active" : "inactive";
        if (fields.isPro) {
          const now = new Date();
          merged.subscriptionStart = now.toISOString();
          const oneYear = new Date();
          oneYear.setFullYear(oneYear.getFullYear() + 1);
          merged.subscriptionExpiry = oneYear.toISOString();
        } else {
          merged.subscriptionStart = null;
          merged.subscriptionExpiry = null;
        }
      }
      
      delete (merged as any).isPro;

      await setDoc(docRef, merged, { merge: true });
      localStorage.setItem(`veritas_profile_${userId}`, JSON.stringify(merged));
    } catch (e: any) {
      console.warn("Could not update profile to Cloud. Saving locally.", e);
    }
  },

  async signUp(email: string, password?: string) {
    try {
      const finalPassword = password || "password123";
      const userCredential = await createUserWithEmailAndPassword(auth, email, finalPassword);
      const user = userCredential.user;
      return { data: { user: { id: user.uid, email: user.email } }, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || String(error) } };
    }
  },

  async signIn(email: string, password?: string) {
    try {
      const finalPassword = password || "password123";
      // Check if current user is already logged in as this email
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email === email) {
        return { data: { user: { id: currentUser.uid, email: currentUser.email } }, error: null };
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, finalPassword);
      const user = userCredential.user;
      return { data: { user: { id: user.uid, email: user.email } }, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || String(error) } };
    }
  },

  async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.warn("Logout session dropped or already invalid:", error);
    }
  },

  async getCurrentUser() {
    try {
      if (auth.currentUser) {
        return { id: auth.currentUser.uid, email: auth.currentUser.email };
      }
      return new Promise<{ id: string; email: string | null } | null>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          if (user) {
            resolve({ id: user.uid, email: user.email });
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      return null;
    }
  },

  async fetchCases(): Promise<LegalCase[]> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return [];

    try {
      const casesRef = collection(db, "cases");
      // Query documents owned by current authenticated user
      const q = query(
        casesRef, 
        where("userId", "==", currentUser.id),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      
      const results: LegalCase[] = [];
      querySnapshot.forEach((docSnap) => {
        const docData = docSnap.data();
        let parsedHistory = [];
        if (docData.hearingHistory) {
          try {
            parsedHistory = typeof docData.hearingHistory === "string"
              ? JSON.parse(docData.hearingHistory)
              : docData.hearingHistory;
          } catch (e) {
            console.error("Historical record deserialization failure:", e);
          }
        }
        results.push({
          id: Number(docData.id || docSnap.id.split("_")[1] || docSnap.id),
          caseIndexNo: docData.caseIndexNo || "",
          petitionerParty: docData.petitionerParty || "",
          respondentParty: docData.respondentParty || "",
          advocateOnRecord: docData.advocateOnRecord || "",
          classificationCategory: docData.classificationCategory || "Writ",
          judicialForum: docData.judicialForum || "",
          writCaseType: docData.writCaseType || "",
          filingYearTarget: Number(docData.filingYearTarget || 2024),
          currentCaseStatus: docData.currentCaseStatus || "",
          keywordsContentMapping: docData.keywordsContentMapping || "",
          filingDateStart: docData.filingDateStart || "",
          filingDateEnd: docData.filingDateEnd || "",
          hearingDateStart: docData.hearingDateStart || "",
          hearingDateEnd: docData.hearingDateEnd || "",
          hearingIndex: Number(docData.hearingIndex || 1),
          notes: docData.notes || "",
          caseSummary: docData.caseSummary || "",
          petitionerContact: docData.petitionerContact || "",
          respondentContact: docData.respondentContact || "",
          hearingHistory: parsedHistory,
          createdAt: docData.createdAt || new Date().toISOString(),
          updatedAt: docData.updatedAt || new Date().toISOString(),
          userId: docData.userId || currentUser.id
        } as LegalCase);
      });

      // Maintain latest record sorting chronology
      results.sort((a, b) => {
        const atime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const btime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return btime - atime;
      });

      return results;
    } catch (error: any) {
      console.warn("Firestore Database cases collection is not provisioned or offline. Falling back to robust user local persistence:", error);
      if (error?.code === "permission-denied" || error?.message?.includes("permissions")) {
        handleFirestoreError(error, OperationType.LIST, "cases");
      }
      const key = `local_firebase_fallback_${currentUser.id}`;
      try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
  },

  async saveCase(c: Omit<LegalCase, "id"> & { id?: number }): Promise<LegalCase> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error("No active authenticated session detected.");
    }

    let savedId = c.id;
    let createdAtStr = new Date().toISOString();
    const isNew = !savedId;

    if (isNew) {
      // Fetch user profile and check monthly limits
      const profile = await this.getOrInitializeUserProfile(currentUser.id);
      if (profile.plan !== "pro") {
        if (profile.monthlyCaseCount >= 20) {
          throw new Error("MONTHLY_LIMIT_REACHED");
        }
        
        // Increment monthly count
        profile.monthlyCaseCount += 1;
        try {
          const docRef = doc(db, "users", currentUser.id);
          await setDoc(docRef, profile, { merge: true });
          localStorage.setItem(`veritas_profile_${currentUser.id}`, JSON.stringify(profile));
        } catch (profileErr) {
          console.warn("Could not increment case limit on cloud. Keeping local count.", profileErr);
        }
      }
    }

    if (savedId) {
      try {
        const caseDocRef = doc(db, "cases", `${currentUser.id}_${savedId}`);
        const docSnap = await getDoc(caseDocRef);
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          if (existingData.userId !== currentUser.id) {
            throw new Error("Access Denied: Attempted to edit a case owned by another user.");
          }
          if (existingData.createdAt) {
            createdAtStr = existingData.createdAt;
          }
        }
      } catch (error: any) {
        console.error("Ownership review error:", error);
        if (error?.code === "permission-denied" || error?.message?.includes("permissions")) {
          handleFirestoreError(error, OperationType.GET, `cases/${currentUser.id}_${savedId}`);
        }
      }
    } else {
      savedId = Date.now();
    }

    const docPayload = {
      id: savedId,
      userId: currentUser.id,
      caseIndexNo: c.caseIndexNo || "",
      petitionerParty: c.petitionerParty || "",
      respondentParty: c.respondentParty || "",
      advocateOnRecord: c.advocateOnRecord || "",
      classificationCategory: c.classificationCategory || "Writ",
      judicialForum: c.judicialForum || "",
      writCaseType: c.writCaseType || "",
      filingYearTarget: Number(c.filingYearTarget || 2024),
      currentCaseStatus: c.currentCaseStatus || "",
      keywordsContentMapping: c.keywordsContentMapping || "",
      filingDateStart: c.filingDateStart || "",
      filingDateEnd: c.filingDateEnd || "",
      hearingDateStart: c.hearingDateStart || "",
      hearingDateEnd: c.hearingDateEnd || "",
      hearingIndex: Number(c.hearingIndex || 1),
      notes: c.notes || "",
      caseSummary: c.caseSummary || "",
      petitionerContact: c.petitionerContact || "",
      respondentContact: c.respondentContact || "",
      hearingHistory: JSON.stringify(c.hearingHistory || []),
      createdAt: createdAtStr,
      updatedAt: new Date().toISOString()
    };

    try {
      const caseDocRef = doc(db, "cases", `${currentUser.id}_${savedId}`);
      await setDoc(caseDocRef, docPayload, { merge: true });
    } catch (dbError: any) {
      console.warn("Database write operation mapped to secure local storage fallback:", dbError);
      if (dbError?.code === "permission-denied" || dbError?.message?.includes("permissions")) {
        handleFirestoreError(dbError, OperationType.WRITE, `cases/${currentUser.id}_${savedId}`);
      }
    }

    // Always keep fallback synchronized so user experiences immediate persistence
    const key = `local_firebase_fallback_${currentUser.id}`;
    let casesList: LegalCase[] = [];
    try {
      casesList = JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {}

    const targetCase: LegalCase = {
      ...c,
      id: savedId,
      userId: currentUser.id,
      createdAt: createdAtStr,
      updatedAt: new Date().toISOString(),
      hearingHistory: c.hearingHistory || []
    };

    const idx = casesList.findIndex(x => x.id === savedId);
    if (idx > -1) {
      casesList[idx] = targetCase;
    } else {
      casesList.unshift(targetCase);
    }
    localStorage.setItem(key, JSON.stringify(casesList));

    return targetCase;
  },

  async deleteCase(id: number): Promise<void> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error("No active authenticated session detected.");
    }

    try {
      const caseDocRef = doc(db, "cases", `${currentUser.id}_${id}`);
      const docSnap = await getDoc(caseDocRef);
      if (docSnap.exists()) {
        const existingData = docSnap.data();
        if (existingData.userId !== currentUser.id) {
          throw new Error("Access Denied: Attempted to delete a case owned by another user.");
        }
        await deleteDoc(caseDocRef);
      }
    } catch (error: any) {
      console.warn("Could not delete document from cloud database, mapping sync locally:", error);
      if (error?.code === "permission-denied" || error?.message?.includes("permissions")) {
        handleFirestoreError(error, OperationType.DELETE, `cases/${currentUser.id}_${id}`);
      }
    }

    // Purge record locally as well
    const key = `local_firebase_fallback_${currentUser.id}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const casesList: LegalCase[] = JSON.parse(stored);
        const updated = casesList.filter(x => x.id !== id);
        localStorage.setItem(key, JSON.stringify(updated));
      }
    } catch (e) {}
  }
};
