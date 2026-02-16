import {
  databases,
  DATABASE_ID,
  RESTAURANT_WALLET_COLLECTION_ID,
} from "./appwrite.config";
import { Query } from "appwrite";

/**
 * Service class for handling all Appwrite database operations related to Orders.
 */
class RestaurantWallet {
  constructor() {
    this.databases = databases;
    this.databaseId = DATABASE_ID;
    this.collectionId = RESTAURANT_WALLET_COLLECTION_ID;
  }

  /**
   * Fetches a list of orders from the Appwrite database with optional date and status filters.
   * @param {string | null} [startDateIso=null] - Optional start date in ISO 8601 string format.
   * @param {string | null} [endDateIso=null] - Optional end date in ISO 8601 string format.
   * @param {string} [status='all'] - Order status to filter by (e.g., 'delivered', 'cancelled'). Use 'all' for no status filter.
   * @returns {Promise<Object>} - A promise that resolves with the list of orders.
   */
  async getRestaurantsWallet(
    startDateIso = null,
    endDateIso = null,
    status = "all"
  ) {
    try {
      const queries = [];
      queries.push(Query.limit(10000000));
      queries.push(Query.select(["*", "restaurantId.*"]));

      const response = await this.databases.listRows({
        databaseId: this.databaseId,
        tableId: this.collectionId,
        queries: queries,
      });

      return {
        success: true,
        data: response.rows,
        total: response.total,
      };
    } catch (error) {
      console.error("Appwrite Error fetching orders: ", error);
      return {
        success: false,
        data: [],
        total: 0,
        error: error.message,
      };
    }
  }
}

export const restaurantWallet = new RestaurantWallet();
