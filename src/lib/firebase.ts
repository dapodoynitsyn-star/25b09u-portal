// Инициализация Firebase.
// Заполните .env (см. .env.example) значениями из консоли Firebase проекта.
import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
}

// Экспортируем как есть — если .env не заполнен, приложение работает
// на локальном демо-хранилище (см. src/services), чтобы сайт был
// кликабельным сразу после установки зависимостей, без Firebase.
export { app, auth, db, storage }

// Названия коллекций Firestore — используются сервисами.
export const COLLECTIONS = {
  users: 'users',
  homework: 'homework',
  subjects: 'subjects',
  schedule: 'schedule',
  announcements: 'announcements',
  calendar: 'calendar',
  materials: 'materials',
} as const
