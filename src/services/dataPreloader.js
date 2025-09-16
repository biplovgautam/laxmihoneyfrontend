// src/services/dataPreloader.js
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

class DataPreloader {
  constructor() {
    this.cache = {
      products: null,
      featuredProducts: null,
      categories: null,
      lastFetch: null
    };
    this.isPreloading = false;
  }

  // Check if data is fresh (less than 5 minutes old)
  isDataFresh() {
    if (!this.cache.lastFetch) return false;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - this.cache.lastFetch < fiveMinutes;
  }

  // Preload all essential data
  async preloadEssentialData() {
    if (this.isPreloading || this.isDataFresh()) {
      return this.cache;
    }

    this.isPreloading = true;
    console.log('🚀 Preloading essential data...');

    try {
      // Run all data fetching in parallel for maximum speed
      const [products, featuredProducts] = await Promise.all([
        this.fetchProducts(),
        this.fetchFeaturedProducts()
      ]);

      // Update cache
      this.cache = {
        products,
        featuredProducts,
        categories: this.extractCategories(products),
        lastFetch: Date.now()
      };

      // Store in sessionStorage for page refreshes
      sessionStorage.setItem('preloadedData', JSON.stringify({
        ...this.cache,
        lastFetch: Date.now()
      }));

      console.log('✅ Data preloading completed!', {
        products: products?.length || 0,
        featuredProducts: featuredProducts?.length || 0
      });

      return this.cache;
    } catch (error) {
      console.error('❌ Error preloading data:', error);
      return null;
    } finally {
      this.isPreloading = false;
    }
  }

  // Fetch all products
  async fetchProducts() {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Fetch featured products
  async fetchFeaturedProducts() {
    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef, 
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(6)
      );
      const snapshot = await getDocs(q);
      
      const featured = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // If no featured products found, get the first 6 products
      if (featured.length === 0) {
        const fallbackQuery = query(
          productsRef,
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);
        return fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }

      return featured;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  // Extract unique categories from products
  extractCategories(products) {
    if (!products || products.length === 0) return [];
    
    const categories = new Set();
    products.forEach(product => {
      if (product.category) {
        categories.add(product.category.toLowerCase());
      }
    });
    
    return ['all', ...Array.from(categories)];
  }

  // Get cached data
  getCachedData() {
    // First try memory cache
    if (this.isDataFresh()) {
      return this.cache;
    }

    // Then try sessionStorage
    try {
      const stored = sessionStorage.getItem('preloadedData');
      if (stored) {
        const data = JSON.parse(stored);
        const fiveMinutes = 5 * 60 * 1000;
        
        if (Date.now() - data.lastFetch < fiveMinutes) {
          this.cache = data;
          return data;
        }
      }
    } catch (error) {
      console.error('Error reading cached data:', error);
    }

    return null;
  }

  // Get specific cached data
  getProducts() {
    const cached = this.getCachedData();
    return cached?.products || null;
  }

  getFeaturedProducts() {
    const cached = this.getCachedData();
    return cached?.featuredProducts || null;
  }

  getCategories() {
    const cached = this.getCachedData();
    return cached?.categories || ['all'];
  }

  // Clear cache
  clearCache() {
    this.cache = {
      products: null,
      featuredProducts: null,
      categories: null,
      lastFetch: null
    };
    sessionStorage.removeItem('preloadedData');
  }

  // Refresh data (force reload)
  async refreshData() {
    this.clearCache();
    return await this.preloadEssentialData();
  }
}

// Create singleton instance
const dataPreloader = new DataPreloader();

export default dataPreloader;
