'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Hook pour suivre le nombre de notifications non lues en temps réel.
 */
export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const notifRef = collection(db, 'users', user.uid, 'notifications');
        const q = query(notifRef, where('read', '==', false));

        const unsubscribeSnap = onSnapshot(q, (snap) => {
          setUnreadCount(snap.size);
        });

        return () => unsubscribeSnap();
      } else {
        setUnreadCount(0);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return unreadCount;
}
