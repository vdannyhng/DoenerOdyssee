import 'expo-sqlite/localStorage/install';

/** Native: localStorage-API auf Basis von expo-sqlite (für Sitzung und Geräte-Einstellungen) */
export const appStorage: Storage = globalThis.localStorage;
