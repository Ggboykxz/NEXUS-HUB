
'use server';

import { doc, getDoc, updateDoc, increment, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Helper to check if two dates are on the same day, ignoring time
const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

// Helper to check if a date was yesterday
const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(date, yesterday);
};

/**
 * Checks the user's daily login streak and awards them if applicable.
 * @param userId - The ID of the user to check.
 * @returns A promise that resolves to an object indicating if a reward was awarded,
 * the amount of coins, and the new streak count.
 */
export async function checkAndAwardDailyStreak(userId: string): Promise<{ awarded: boolean, coins: number, streakDays: number }> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return { awarded: false, coins: 0, streakDays: 0 };
    }

    const userData = userSnap.data();
    const streakLastAt: Timestamp | undefined = userData.streakLastAt;
    let streakDays: number = userData.streakDays || 0;
    let awarded = false;
    const coinsAwarded = 2;

    const now = new Date();

    if (streakLastAt) {
        const lastClaimDate = streakLastAt.toDate();
        if (isSameDay(lastClaimDate, now)) {
            // Already claimed today, no reward
            return { awarded: false, coins: 0, streakDays };
        } else if (isYesterday(lastClaimDate)) {
            // Streak continues
            streakDays += 1;
            awarded = true;
        } else {
            // Streak broken, reset to 1
            streakDays = 1;
            awarded = true;
        }
    } else {
        // First ever claim
        streakDays = 1;
        awarded = true;
    }

    if (awarded) {
        try {
            const transactionsRef = collection(db, 'users', userId, 'transactions');
            await updateDoc(userRef, {
                africoins: increment(coinsAwarded),
                streakDays: streakDays,
                streakLastAt: serverTimestamp()
            });
            await addDoc(transactionsRef, {
                type: 'streak',
                coins: coinsAwarded,
                createdAt: serverTimestamp(),
                description: `Récompense pour une série de ${streakDays} jours`
            });
            
            return { awarded: true, coins: coinsAwarded, streakDays };

        } catch (error) {
             console.error("Failed to award daily streak:", error);
             // If update fails, we shouldn't confirm the award
             return { awarded: false, coins: 0, streakDays: userData.streakDays || 0 };
        }
    }
    
    // This case is for when no award is given (already claimed)
    return { awarded: false, coins: 0, streakDays };
}
