// services/appwrite.js
import { Client, Databases } from 'appwrite';
import config from '../config.js';

// Initialize Appwrite Client
const client = new Client();

// Only set endpoint and project if they exist
if (config.endpoint) {
    client.setEndpoint(config.endpoint);
}
if (config.projectId) {
    client.setProject(config.projectId);
}

// Initialize Databases
export const databases = new Databases(client);