import { Account, Client, Storage, TablesDB } from "appwrite";
import {
  endpoint,
  projectId,
  databaseId,
  orderId,
  expense,
} from "../conf/conf";

// *** REPLACE THESE WITH YOUR ACTUAL APPWRITE CREDENTIALS ***
const APPWRITE_ENDPOINT = endpoint;
const PROJECT_ID = projectId;
const DATABASE_ID = databaseId;
const ORDER_COLLECTION_ID = orderId;
const EXPENSE_COLLECTION_ID = expense;

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(PROJECT_ID);

const databases = new TablesDB(client);
const account = new Account(client);
const storage = new Storage(client);

// Export the IDs and databases instance for use in the service class
export {
  account,
  databases,
  client,
  DATABASE_ID,
  ORDER_COLLECTION_ID,
  EXPENSE_COLLECTION_ID,
  APPWRITE_ENDPOINT,
  PROJECT_ID,
  storage,
};
