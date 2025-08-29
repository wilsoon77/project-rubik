//archivo de configuración - config.js
const appwriteConfig = {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
    collectionId: import.meta.env.VITE_APPWRITE_COLLECTION_ID || ''
};

// Verificación de configuración
console.log("Config cargada:", {
    endpoint: appwriteConfig.endpoint ? "✅ OK" : "❌ ERROR",
    projectId: appwriteConfig.projectId ? "✅ OK" : "❌ ERROR",
    databaseId: appwriteConfig.databaseId ? "✅ OK" : "❌ ERROR",
    collectionId: appwriteConfig.collectionId ? "✅ OK" : "❌ ERROR"
});

export default appwriteConfig;