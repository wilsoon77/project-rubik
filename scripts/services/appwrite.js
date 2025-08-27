// services/appwrite.js
import { Client, Databases } from 'appwrite';
import config from '../config';

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

// Initialize Databases
export const databases = new Databases(client);