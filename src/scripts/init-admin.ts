
/**
 * @fileOverview Script d'initialisation pour promouvoir un utilisateur au rang d'Admin.
 * Utilisation : npm run init-admin -- --email "user@example.com"
 */
import { getAdminServices } from '../lib/firebase-admin';

async function promoteToAdmin() {
  const { adminDb } = getAdminServices();
  const args = process.argv.slice(2);
  const emailArg = args.find(a => a.startsWith('--email='));
  const uidArg = args.find(a => a.startsWith('--uid='));

  const email = emailArg ? emailArg.split('=')[1] : null;
  const uid = uidArg ? uidArg.split('=')[1] : null;

  if (!email && !uid) {
    console.error("❌ Erreur : Vous devez fournir --email=... ou --uid=");
    process.exit(1);
  }

  try {
    let userRef;
    if (uid) {
      userRef = adminDb.collection('users').doc(uid);
    } else {
      const snap = await adminDb.collection('users').where('email', '==', email).limit(1).get();
      if (snap.empty) {
        console.error(`❌ Utilisateur introuvable avec l'email : ${email}`);
        process.exit(1);
      }
      userRef = snap.docs[0].ref;
    }

    await userRef.update({
      role: 'admin',
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Succès : L'utilisateur est désormais Administrateur du Nexus.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la promotion :", error);
    process.exit(1);
  }
}

promoteToAdmin();
