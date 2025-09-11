import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PlusIcon } from '@heroicons/react/24/outline';
import Toast from '../Toast';

const SampleDataLoader = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const sampleProducts = [
    {
      title: "Pure Wild Honey",
      desc: "100% natural honey harvested from wild bees in the pristine forests of Nepal. Rich in antioxidants and natural enzymes.",
      price: 1200,
      originalPrice: 1500,
      category: "Pure Honey",
      badges: ["Best Seller", "Organic"],
      images: [
        "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=500",
        "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500"
      ],
      rating: 4.8,
      reviews: 125,
      createdAt: new Date()
    },
    {
      title: "Mustard Honey",
      desc: "Premium mustard flower honey with a unique flavor profile. Perfect for daily consumption and natural health benefits.",
      price: 900,
      originalPrice: 1100,
      category: "Pure Honey",
      badges: ["Natural"],
      images: [
        "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=500"
      ],
      rating: 4.6,
      reviews: 89,
      createdAt: new Date()
    },
    {
      title: "Rhododendron Honey",
      desc: "Rare and exquisite honey collected from rhododendron flowers in the high-altitude regions of Nepal.",
      price: 2500,
      originalPrice: 3000,
      category: "Premium",
      badges: ["Limited Edition", "Premium"],
      images: [
        "https://images.unsplash.com/photo-1516824726135-1ce6cf0b14b5?w=500"
      ],
      rating: 4.9,
      reviews: 45,
      createdAt: new Date()
    },
    {
      title: "Honey Gift Set",
      desc: "Beautiful gift set containing 3 varieties of our finest honey in elegant packaging. Perfect for special occasions.",
      price: 3500,
      originalPrice: 4000,
      category: "Gift Sets",
      badges: ["Best Seller", "Gift"],
      images: [
        "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=500"
      ],
      rating: 4.7,
      reviews: 67,
      createdAt: new Date()
    }
  ];

  const sampleOrders = [
    {
      customerName: "Rajesh Sharma",
      customerEmail: "rajesh@example.com",
      customerPhone: "+977-9801234567",
      shippingAddress: "Kathmandu, Nepal",
      items: [
        {
          title: "Pure Wild Honey",
          price: 1200,
          quantity: 2,
          image: "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=500"
        }
      ],
      status: "new",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      updatedAt: new Date()
    },
    {
      customerName: "Priya Thapa",
      customerEmail: "priya@example.com",
      customerPhone: "+977-9812345678",
      shippingAddress: "Pokhara, Nepal",
      items: [
        {
          title: "Mustard Honey",
          price: 900,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=500"
        },
        {
          title: "Rhododendron Honey",
          price: 2500,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1516824726135-1ce6cf0b14b5?w=500"
        }
      ],
      status: "processing",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      updatedAt: new Date()
    },
    {
      customerName: "Amit Gurung",
      customerEmail: "amit@example.com",
      customerPhone: "+977-9823456789",
      shippingAddress: "Lalitpur, Nepal",
      items: [
        {
          title: "Honey Gift Set",
          price: 3500,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=500"
        }
      ],
      status: "shipped",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      updatedAt: new Date()
    }
  ];

  const addSampleData = async () => {
    setLoading(true);
    try {
      // Add sample products
      for (const product of sampleProducts) {
        await addDoc(collection(db, 'products'), product);
      }
      
      // Add sample orders
      for (const order of sampleOrders) {
        await addDoc(collection(db, 'orders'), order);
      }
      
      showToast('Sample data added successfully!');
    } catch (error) {
      console.error('Error adding sample data:', error);
      showToast('Error adding sample data', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Sample Data</h2>
      <p className="text-gray-600 mb-4">
        Add sample products and orders to test the admin panel functionality.
      </p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={addSampleData}
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
      >
        <PlusIcon className="h-5 w-5" />
        <span>{loading ? 'Adding Sample Data...' : 'Add Sample Data'}</span>
      </motion.button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default SampleDataLoader;
