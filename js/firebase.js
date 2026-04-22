import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp, orderBy } from 'firebase/firestore';

// TODO: Replace with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyCpwBFlN7bRGmIP8uS0uPXH5keN5ppWBKs",
    authDomain: "digital-peg-board.firebaseapp.com",
    projectId: "digital-peg-board",
    storageBucket: "digital-peg-board.firebasestorage.app",
    messagingSenderId: "931741976858",
    appId: "1:931741976858:web:e10ff6bd48648029b504a3",
    measurementId: "G-8NFNWNQJ61"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get or generate User ID
function getUserId() {
    let userId = localStorage.getItem('peg_board_userId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('peg_board_userId', userId);
    }
    return userId;
}

export const FirebaseDB = {
    userId: getUserId(),

    async saveDesign(designData) {
        try {
            const designsRef = collection(db, "designs");
            await addDoc(designsRef, {
                userId: this.userId,
                name: designData.name || `Design ${new Date().toLocaleDateString()}`,
                score: designData.score || 0,
                shapes: designData.shapes || [],
                timestamp: serverTimestamp()
            });
            return true;
        } catch (e) {
            console.error("Error saving document: ", e);
            return false;
        }
    },

    async getUserDesigns() {
        try {
            const designsRef = collection(db, "designs");
            // Sometimes Firestore requires an index for orderBy combined with where.
            const fallbackQ = query(designsRef, where("userId", "==", this.userId));
            const snap = await getDocs(fallbackQ);

            const results = [];
            snap.forEach(doc => results.push({ id: doc.id, ...doc.data() }));

            // Sort manually client-side to avoid needing a composite index
            return results.sort((a, b) => {
                const timeA = a.timestamp?.seconds || 0;
                const timeB = b.timestamp?.seconds || 0;
                return timeB - timeA;
            });
        } catch (e) {
            console.error("Error getting designs: ", e);
            return [];
        }
    }
};
