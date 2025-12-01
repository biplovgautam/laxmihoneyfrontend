# Firestore Composite Indexes Required

This document lists the Firestore composite indexes required for the product soft-delete feature.

## Products Collection

### Index 1: Active Products with Creation Date
**Collection ID:** `products`
**Fields:**
- `isActive` (Ascending)
- `createdAt` (Descending)

**Query scope:** Collection

**Usage:** Used to fetch all active products sorted by creation date.

### Index 2: Featured and Active Products
**Collection ID:** `products`
**Fields:**
- `featured` (Ascending)
- `isActive` (Ascending)
- `createdAt` (Descending)

**Query scope:** Collection

**Usage:** Used to fetch featured active products.

### Index 3: Featured Products with Status
**Collection ID:** `products`
**Fields:**
- `isFeatured` (Ascending)
- `isActive` (Ascending)
- `createdAt` (Descending)

**Query scope:** Collection

**Usage:** Used to fetch featured active products (alternate field name).

## How to Create These Indexes

### Option 1: Automatic (Recommended)
1. Run your application
2. When you trigger queries that need these indexes, Firebase will show error messages with direct links
3. Click the provided link to automatically create the index
4. Wait 2-5 minutes for the index to build

### Option 2: Manual via Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database → Indexes tab
4. Click "Add Index"
5. Enter the collection ID and fields as specified above
6. Click "Create"

### Option 3: Using Firebase CLI
Create a `firestore.indexes.json` file with the following content:

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "featured",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "isFeatured",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}
```

Then run:
```bash
firebase deploy --only firestore:indexes
```

## Notes

- Indexes typically take 2-5 minutes to build
- The application will not work properly until indexes are created
- Firebase will show helpful error messages with direct links to create missing indexes
- Single-field indexes are created automatically by Firebase
