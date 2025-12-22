/**
 * Firebase Configuration
 * Project: gomoku-game-47ec9
 */
const firebaseConfig = {
    apiKey: "AIzaSyDXvsT-wdi-dh-kb2a5JoMYE93i8uBei",
    authDomain: "gomoku-game-47ec9.firebaseapp.com",
    databaseURL: "https://gomoku-game-47ec9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "gomoku-game-47ec9",
    storageBucket: "gomoku-game-47ec9.firebasestorage.app",
    messagingSenderId: "241405606692",
    appId: "1:241405606692:web:e45fe518b38a"
};

// Initialize Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log(`[Firebase] Initialized successfully - Project: ${firebaseConfig.projectId}`);
    console.log(`[Firebase] Database URL: ${firebaseConfig.databaseURL}`);
} else if (typeof firebase !== 'undefined' && firebase.apps.length) {
    console.log('[Firebase] Already initialized');
} else {
    console.warn('[Firebase] SDK not loaded');
}
