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
      
      // Filter out deleted products (isActive === false) on client side
      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(product => product.isActive !== false);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Fetch featured products
  async fetchFeaturedProducts() {
    try {
      const productsRef = collection(db, 'products');
      
      // Try to get featured products (using isFeatured field)
      const q = query(
        productsRef, 
        where('isFeatured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (indexError) {
        console.log('Featured query needs index, falling back to all products');
        // Fallback: get all products and filter client-side
        const fallbackQuery = query(
          productsRef,
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        snapshot = await getDocs(fallbackQuery);
      }
      
      // Filter out deleted products and get featured ones on client side
      const allProducts = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(product => product.isActive !== false);
      
      // Try to find featured products
      let featured = allProducts.filter(product => 
        product.isFeatured === true || product.featured === true
      ).slice(0, 6);

      // If no featured products found, get the first 6 active products
      if (featured.length === 0) {
        featured = allProducts.slice(0, 6);
      }

      return featured;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // Last resort: try without any where clause
      try {
        const fallbackQuery = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);
        return fallbackSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(product => product.isActive !== false)
          .slice(0, 6);
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return [];
      }
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
