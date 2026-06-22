# API Route Migration Guide

## Overview

This guide explains how to migrate your existing API routes to use the new RBAC system.

## Step-by-Step Migration

### Step 1: Add Import
```typescript
// Before
export const GET = async (req: NextRequest) => { ... }

// After - Add import
import { withAuth, applyBranchFilter } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(async (req, authContext) => { ... }
```

### Step 2: Replace Route Handler

#### Before
```typescript
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    // Route logic
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
};
```

#### After
```typescript
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";

export const POST = withAuth(async (req, authContext) => {
  // authContext has: userId, businessId, branchId, role
  // Route logic
  return NextResponse.json(data);
});
```

### Step 3: Add Permission Checks (if needed)

```typescript
export const DELETE = withAuth(async (req, authContext) => {
  // Check if user has permission
  if (authContext.role === "CASHIER") {
    return NextResponse.json(
      { error: "Cashiers cannot delete products" },
      { status: 403 }
    );
  }

  // Proceed with deletion
});
```

### Step 4: Add Branch Filtering (for data queries)

```typescript
import { applyBranchFilter } from "@/lib/api-auth";

export const GET = withAuth(async (req, authContext) => {
  const query: any = {
    where: {
      businessId: authContext.businessId,
    },
  };

  // This automatically adds branchId filter for MANAGER/CASHIER
  // OWNER sees all branches
  applyBranchFilter(query.where, authContext);

  const sales = await db.sale.findMany(query);
  return NextResponse.json(sales);
});
```

## Common Scenarios

### Scenario 1: Read-Only List (All Roles Can View)

**File: `app/api/products/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { withAuth, applyBranchFilter } from "@/lib/api-auth";
import { db } from "@/lib/db";

export const GET = withAuth(async (req, authContext) => {
  try {
    const query: any = {
      where: {
        businessId: authContext.businessId,
      },
    };

    // Apply branch filter - MANAGER/CASHIER see only their branch
    applyBranchFilter(query.where, authContext);

    const products = await db.product.findMany(query);

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
});
```

### Scenario 2: Create (Restricted to MANAGER+)

**File: `app/api/products/route.ts`**

```typescript
export const POST = withAuth(async (req, authContext) => {
  // Check permission
  if (!["OWNER", "MANAGER"].includes(authContext.role)) {
    return NextResponse.json(
      { error: "Only managers can create products" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    const product = await db.product.create({
      data: {
        ...body,
        businessId: authContext.businessId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 400 });
  }
});
```

### Scenario 3: Delete (Owner Only)

**File: `app/api/branches/[id]/route.ts`**

```typescript
export const DELETE = withAuth(async (req, authContext) => {
  // Restrict to owner
  if (authContext.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only business owners can delete branches" },
      { status: 403 }
    );
  }

  try {
    const { id } = await req.json();

    const branch = await db.branch.delete({
      where: {
        id,
        businessId: authContext.businessId, // Ensure ownership
      },
    });

    return NextResponse.json(branch);
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 400 });
  }
});
```

### Scenario 4: Update with Branch Filter

**File: `app/api/sales/[id]/route.ts`**

```typescript
import { verifyBranchAccess } from "@/lib/api-auth";

export const PATCH = withAuth(async (req, authContext) => {
  try {
    const { id } = req.nextUrl.searchParams;
    const body = await req.json();

    // Get the sale first
    const sale = await db.sale.findUnique({
      where: { id },
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Verify user can access this branch
    const canAccess = await verifyBranchAccess(authContext.userId, sale.branchId);
    if (!canAccess) {
      return NextResponse.json(
        { error: "You cannot access this sale" },
        { status: 403 }
      );
    }

    // Update sale
    const updated = await db.sale.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
});
```

### Scenario 5: Admin-Only Operations

**File: `app/api/users/route.ts`**

```typescript
export const POST = withAuth(async (req, authContext) => {
  // Only OWNER can create users
  if (authContext.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only owners can create users" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    // Create user
    const user = await db.user.create({
      data: {
        ...body,
        businessId: authContext.businessId,
        passwordHash: await hashPassword(body.password),
      },
    });

    // Don't return password
    delete (user as any).passwordHash;

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 400 });
  }
});
```

### Scenario 6: Conditional Response Based on Role

**File: `app/api/reports/route.ts`**

```typescript
export const GET = withAuth(async (req, authContext) => {
  try {
    const baseQuery = {
      businessId: authContext.businessId,
    };

    let query = baseQuery;

    // OWNER sees all branches
    // MANAGER sees only their branch
    // CASHIER sees only their branch
    // SUPER_ADMIN only sees aggregated data
    if (authContext.role === "SUPER_ADMIN") {
      // Return only aggregated statistics
      const stats = {
        totalBranches: await db.branch.count({ where: baseQuery }),
        totalEmployees: await db.user.count({ where: baseQuery }),
        // More aggregates...
      };
      return NextResponse.json(stats);
    }

    // Apply branch filter for MANAGER/CASHIER
    applyBranchFilter(query, authContext);

    const report = await db.sale.findMany({
      where: query,
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 400 });
  }
});
```

## Migration Checklist

### Phase 1: Core Routes
- [ ] `app/api/auth/**` - Auth routes (already protected)
- [ ] `app/api/v1/users/**` - User management
- [ ] `app/api/v1/branches/**` - Branch management

### Phase 2: Operational Routes  
- [ ] `app/api/v1/products/**` - Product management
- [ ] `app/api/v1/categories/**` - Category management
- [ ] `app/api/v1/inventory/**` - Inventory routes

### Phase 3: Transaction Routes
- [ ] `app/api/v1/sales/**` - Sales transactions
- [ ] `app/api/v1/purchases/**` - Purchase orders
- [ ] `app/api/v1/payments/**` - Payment processing

### Phase 4: Administrative Routes
- [ ] `app/api/v1/expenses/**` - Expense tracking
- [ ] `app/api/v1/reports/**` - Report generation
- [ ] `app/api/v1/settings/**` - Settings management

## Best Practices

### ✅ DO

```typescript
// ✅ Always check authentication
export const GET = withAuth(async (req, authContext) => { ... });

// ✅ Always include businessId in queries
where: {
  businessId: authContext.businessId,
  ...
}

// ✅ Apply branch filter for MANAGER/CASHIER
applyBranchFilter(query.where, authContext);

// ✅ Log sensitive operations
console.log(`User ${authContext.userId} deleted product ${id}`);

// ✅ Check permissions before sensitive operations
if (authContext.role !== "OWNER") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### ❌ DON'T

```typescript
// ❌ Don't expose passwords
return NextResponse.json(user); // Still has passwordHash!

// ❌ Don't skip businessId filter
const products = await db.product.findMany(); // WRONG!

// ❌ Don't trust client role values
if (req.headers.get("x-user-role") === "OWNER") { // WRONG!

// ❌ Don't ignore branch access
const sales = await db.sale.findMany({
  where: { branchId: req.body.branchId } // User might not have access!
});

// ❌ Don't log sensitive data
console.log("User created:", user); // Logs password!
```

## Error Responses

### Standard HTTP Status Codes

```typescript
// 200 OK - Success
return NextResponse.json(data);

// 201 Created - Resource created
return NextResponse.json(data, { status: 201 });

// 400 Bad Request - Invalid input
return NextResponse.json({ error: "Invalid input" }, { status: 400 });

// 401 Unauthorized - Not authenticated
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// 403 Forbidden - No permission
return NextResponse.json({ error: "Forbidden" }, { status: 403 });

// 404 Not Found - Resource not found
return NextResponse.json({ error: "Not found" }, { status: 404 });

// 500 Internal Server Error - Server error
return NextResponse.json({ error: "Server error" }, { status: 500 });
```

## Testing

### Unit Test Example

```typescript
import { hasPermission } from "@/lib/rbac";

describe("RBAC Permissions", () => {
  it("should allow OWNER to delete products", () => {
    const canDelete = hasPermission("OWNER", "products", "delete");
    expect(canDelete).toBe(true);
  });

  it("should deny CASHIER to delete products", () => {
    const canDelete = hasPermission("CASHIER", "products", "delete");
    expect(canDelete).toBe(false);
  });
});
```

### Integration Test Example

```typescript
// Test with CASHIER role
const response = await fetch("/api/products", {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
    // Auth header set in middleware
  },
});

expect(response.status).toBe(403);
```

## Summary

1. ✅ Wrap route with `withAuth()`
2. ✅ Access user info via `authContext`
3. ✅ Check permissions for restricted operations
4. ✅ Apply branch filter for multi-warehouse data
5. ✅ Never expose sensitive information
6. ✅ Test with different roles

**Timeline**: Aim to complete Phase 1-2 routes first, then Phase 3-4.
