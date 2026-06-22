# Role-Based Access Control (RBAC) Implementation

## Overview

This document describes the comprehensive role-based access control system implemented for DynaPos POS Management System. The system restricts access to features and data based on user roles.

## Roles & Responsibilities

### 1. **CASHIER** 👨‍💼
**Purpose**: Point-of-sale operations and basic transactions

**Accessible Features**:
- ✅ POS Billing - Create and process sales
- ✅ Inventory - View inventory levels and stock information
- ✅ Reports - View transaction reports
- ✅ Customers - View and create new customers
- ✅ Payments - Process customer payments

**Data Access**: 
- Can only see data from their assigned warehouse/branch
- Cannot view other branches' data

**Restrictions**: 
- ❌ Cannot create/edit/delete products, categories, or units
- ❌ Cannot access branch management
- ❌ Cannot manage users or roles
- ❌ Cannot access supplier management
- ❌ Cannot access expense tracking

---

### 2. **MANAGER** 👨‍💼
**Purpose**: Warehouse/branch operations management

**Accessible Features**:
- ✅ Dashboard - View branch metrics
- ✅ POS Billing - Create and process sales
- ✅ Products - View and manage products
- ✅ Categories & Units - Manage product categories
- ✅ Purchases - Manage purchase orders
- ✅ Inventory - Full inventory management
  - Stock adjustments
  - Batch tracking
  - Damage & expiry management
  - Stock transfer between batches
- ✅ Customers - Manage customer information
- ✅ Suppliers - Manage supplier relationships
- ✅ Payments - Process and track payments
- ✅ Reports - Generate and view reports
- ✅ Expenses - Track business expenses
- ✅ Sales History - View transaction records

**Data Access**:
- Limited to **assigned warehouse/branch only**
- Cannot see data from other branches

**Restrictions**:
- ❌ Cannot create/disable branches
- ❌ Cannot manage user roles and permissions
- ❌ Cannot access device control
- ❌ Cannot view activity logs

---

### 3. **OWNER** 👑
**Purpose**: Business ownership and strategic management

**Accessible Features**:
- ✅ All features available to MANAGER
- ✅ **Branches** - Full branch management
  - Create new branches
  - Edit branch details
  - **Enable/Disable branches** ⭐ (unique to owner)
  - View all branches
- ✅ **Users & Roles** - Complete user management
  - Create and manage user accounts
  - Assign roles to employees
  - View user activity logs
  - Manage device access
  - Control branch-level permissions
- ✅ Settings - Configure business settings
- ✅ Full access to all reports and data

**Data Access**:
- Full access to all business data across all branches
- Unlimited user creation (subject to subscription limit)

**Special Permissions**:
- 🔧 Enable/Disable branches
- 🔑 Manage user permissions
- 👥 Assign users to branches
- 🖥️ Control device access

---

### 4. **SUPER_ADMIN** 🛡️
**Purpose**: Platform administration and oversight

**Accessible Features**:
- ✅ Dashboard - View high-level statistics
- ✅ **Branches** - View-only access
  - View all owner branches
  - See branch status (enabled/disabled)
- ✅ **Users & Employees** - View-only access
  - View employee count per branch
  - View user list and roles
  - See user activity

**Restrictions** (Limited access by design):
- ❌ Cannot modify branches
- ❌ Cannot manage users (no create/edit/delete)
- ❌ Cannot access operational features (POS, inventory, etc.)
- ❌ Cannot view financial data in detail
- ❌ Cannot process transactions

**Purpose**: Oversight and reporting to platform/corporate level

---

## Technical Implementation

### 1. RBAC Utilities (`src/lib/rbac.ts`)

Core functions for permission checking:

```typescript
// Check if role has permission
hasPermission(role, resource, action) 

// Check if role can access route
canAccessRoute(role, path)

// Get all allowed routes for role
getAllowedRoutes(role)

// Authorize with detailed response
authorize(role, resource, action)
```

### 2. API Authorization (`src/lib/api-auth.ts`)

Middleware and utilities for protecting API endpoints:

```typescript
// Protect an API route
withAuth(handler)

// Require specific permission for route
requirePermission(resource, action)

// Verify business access
verifyBusinessAccess(userId, businessId)

// Verify branch access
verifyBranchAccess(userId, branchId)

// Apply branch filter to queries
applyBranchFilter(query, authContext)
```

### 3. Client-Side Authorization (`src/lib/client-auth.ts`)

Hooks and utilities for frontend:

```typescript
// Get current user
useUser()

// Check permission
usePermission(resource, action)

// Get filtered navigation
useFilteredNavigation()

// Check user role
isCashier(role)
isManager(role)
isOwner(role)
isSuperAdmin(role)
```

### 4. Protected Components (`src/components/protected.tsx`)

Reusable components for access control:

```tsx
// Protect component with resource+action
<Protected resource="products" action="delete">
  <DeleteButton />
</Protected>

// Admin only
<AdminOnly>
  <AdminPanel />
</AdminOnly>

// Owner only
<OwnerOnly>
  <BranchSettings />
</OwnerOnly>

// Manager and above
<ManagerAndAbove>
  <InventoryManagement />
</ManagerAndAbove>

// Cashier view
<CashierView>
  <POSInterface />
</CashierView>
```

---

## Usage Examples

### Protecting a Page

```typescript
// app/dashboard/products/page.tsx
"use client";
import { useUser } from "@/lib/client-auth";
import { AdminOnly } from "@/components/protected";

export default function ProductsPage() {
  const user = useUser();

  // Option 1: Wrap in component
  return (
    <AdminOnly fallback={<AccessDenied />}>
      <ProductsList />
    </AdminOnly>
  );

  // Option 2: Check and redirect
  if (user?.role === "CASHIER") {
    return <AccessDenied />;
  }

  return <ProductsList />;
}
```

### Protecting an API Route

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { db } from "@/lib/db";

export const POST = withAuth(async (req, authContext) => {
  // Check permission
  if (authContext.role === "CASHIER") {
    return NextResponse.json(
      { error: "Cashiers cannot create products" },
      { status: 403 }
    );
  }

  const body = await req.json();
  
  const product = await db.product.create({
    data: {
      ...body,
      businessId: authContext.businessId,
    },
  });

  return NextResponse.json(product);
});
```

### Conditional UI Elements

```typescript
"use client";
import { IfPermitted, ManagerAndAbove } from "@/components/protected";

export function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>

      {/* Show edit button only for managers and above */}
      <IfPermitted resource="products" action="update">
        <button>Edit Product</button>
      </IfPermitted>

      {/* Show delete button only for owners */}
      <ManagerAndAbove>
        <button>Delete</button>
      </ManagerAndAbove>
    </div>
  );
}
```

---

## Data Filtering by Role

### Manager/Cashier - Branch-Limited Data

Managers and Cashiers can only see data from their assigned branch:

```typescript
// This user can only see their branch
const manager = {
  role: "MANAGER",
  branchId: "branch-123",
};

// API automatically filters to their branch
const sales = await db.sale.findMany({
  where: {
    businessId: manager.businessId,
    branchId: manager.branchId, // ← Applied automatically
  },
});
```

### Owner - Full Business Access

Owners can see all branches and data:

```typescript
// Owner sees all branches
const owner = {
  role: "OWNER",
  branchId: null, // Can access all branches
};

// Can view all branches
const branches = await db.branch.findMany({
  where: {
    businessId: owner.businessId,
    // No branch filter - sees all
  },
});
```

---

## Permission Matrix

| Feature | CASHIER | MANAGER | OWNER | SUPER_ADMIN |
|---------|---------|---------|-------|-------------|
| POS Billing | ✅ Create | ✅ Create | ✅ Create | ❌ |
| Inventory | ✅ View | ✅ Full | ✅ Full | ❌ |
| Reports | ✅ View | ✅ View | ✅ View | ✅ View |
| Customers | ✅ Create | ✅ Full | ✅ Full | ❌ |
| Products | ❌ | ✅ Edit | ✅ Full | ❌ |
| Branches | ❌ | ❌ View | ✅ Full | ✅ View |
| Users | ❌ | ❌ | ✅ Full | ✅ View |
| Settings | ❌ | ❌ | ✅ Edit | ❌ |
| Enable/Disable Branch | ❌ | ❌ | ✅ Yes | ❌ |
| View Employee Count | ❌ | ❌ | ✅ Yes | ✅ Yes |

---

## Security Considerations

1. **Database Level**: Always filter by `businessId` to ensure data isolation
2. **Branch Filtering**: Apply `branchId` filter for Manager/Cashier roles
3. **API Validation**: Always re-check permissions on the backend (don't trust client-side checks)
4. **Sensitive Data**: Never expose password hashes or sensitive fields to non-admin users
5. **Audit Logging**: Log all sensitive operations for compliance

---

## Migration Guide

If you have existing API routes without RBAC:

### Before
```typescript
export const POST = async (req: NextRequest) => {
  const body = await req.json();
  // No authorization check!
  return NextResponse.json(result);
};
```

### After
```typescript
export const POST = withAuth(async (req, authContext) => {
  if (authContext.role === "CASHIER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  return NextResponse.json(result);
});
```

---

## Testing RBAC

### Test Scenarios

1. **Cashier Access Test**
   - Log in as cashier
   - Verify can access: POS, Inventory, Customers, Payments, Reports
   - Verify cannot access: Products, Branches, Users, Settings

2. **Manager Access Test**
   - Log in as manager
   - Verify can access all features except branch management and users
   - Verify branch-filtered data (only sees assigned warehouse)

3. **Owner Access Test**
   - Log in as owner
   - Verify can access all features
   - Verify can enable/disable branches
   - Verify can manage users

4. **Super Admin Access Test**
   - Log in as super admin
   - Verify can see branches (view-only)
   - Verify can see employee count
   - Verify cannot access POS or inventory features

---

## Troubleshooting

### User Cannot Access Route
1. Check user's role in database
2. Verify role is in `navigationConfig` for that route
3. Check middleware route permissions in `auth.config.ts`
4. Review browser console for errors

### API Returns 403
1. Verify user has required permission in `rbac.ts`
2. Check `hasPermission()` is being called correctly
3. Verify `withAuth` wrapper is applied to route
4. Check user's role in the request context

### Data Not Filtering by Branch
1. Verify `applyBranchFilter()` is used in API queries
2. Ensure `branchId` is included in where clause
3. Check that user's `branchId` is set in database
4. Verify role is not OWNER or SUPER_ADMIN (they see all)

---

## Summary

✅ **Implemented Features**:
- Role-based route access control
- API endpoint authorization
- Client-side permission checks
- Protected React components
- Branch-level data filtering
- Comprehensive permission matrix
- Type-safe authorization utilities

🚀 **Next Steps**:
1. Apply RBAC to all existing API routes
2. Add branch enable/disable functionality for OWNER role
3. Implement Super Admin dashboard for branch/employee statistics
4. Add audit logging for sensitive operations
5. Create role management UI for OWNER
