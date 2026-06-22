# DynaPos RBAC Structure

## Role Hierarchy

```
                           BUSINESS OWNER
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
      OWNER              MANAGER (Warehouse)          SUPER_ADMIN
    (Full Access)       (Limited to Branch)          (View-Only)
        │                         │                         │
        ├─ POS Billing            ├─ POS Billing            │
        ├─ Products               ├─ Inventory              │
        ├─ Purchases              ├─ Stock Mgmt             │
        ├─ Inventory              ├─ Customers              │
        ├─ Customers              ├─ Payments               │
        ├─ Suppliers              ├─ Expenses               │
        ├─ Payments               ├─ Reports                │
        ├─ Reports                │                         │
        ├─ Expenses               │                         │
        ├─ Branches ⭐            │                         ├─ Dashboard
        ├─ Users ⭐               │                         ├─ Branches (view)
        ├─ Roles ⭐               │                         ├─ Users (view)
        ├─ Settings ⭐            │                         ├─ Reports (view)
        └─ Enable/Disable Branch ⭐                        └─ Employee Stats
                                                                │
                                                            CASHIER
                                                          (Limited)
                                                                │
                                                            ├─ POS Billing
                                                            ├─ Inventory (view)
                                                            ├─ Customers
                                                            ├─ Payments
                                                            └─ Reports
```

## Permission Matrix

| Feature | CASHIER | MANAGER | OWNER | SUPER_ADMIN |
|---------|:-------:|:-------:|:-----:|:-----------:|
| **POS Billing** | ✅ Create | ✅ Create | ✅ Create | ❌ |
| **Inventory** | 👁️ View | ✅ Full | ✅ Full | ❌ |
| **Products** | ❌ | 👁️ View | ✅ Full | ❌ |
| **Purchases** | ❌ | ✅ Full | ✅ Full | ❌ |
| **Customers** | ✅ View | ✅ Full | ✅ Full | ❌ |
| **Suppliers** | ❌ | ✅ Full | ✅ Full | ❌ |
| **Payments** | ✅ Full | ✅ Full | ✅ Full | ❌ |
| **Reports** | ✅ View | ✅ View | ✅ View | ✅ View |
| **Expenses** | ❌ | ✅ Full | ✅ Full | ❌ |
| **Categories** | ❌ | 👁️ View | ✅ Full | ❌ |
| **Branches** | ❌ | 👁️ View | ✅ Full | 👁️ View |
| **Users** | ❌ | ❌ | ✅ Full | 👁️ View |
| **Enable/Disable Branch** | ❌ | ❌ | ✅ Yes | ❌ |
| **Employee Count** | ❌ | ❌ | ✅ View | ✅ View |
| **Settings** | ❌ | ❌ | ✅ Edit | ❌ |

Legend: ✅ Full access | 👁️ View only | ❌ No access

## Data Access Pattern

```
┌─────────────────────────────────────────────────────┐
│             BUSINESS DATABASE                        │
│  (Shared by all users of a business)                │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ OWNER                                         │ │
│  │ ├─ Access: All Branches & Data                │ │
│  │ ├─ branchId: null (all branches)              │ │
│  │ └─ Query Filter: businessId only              │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ MANAGER (Branch A)                            │ │
│  │ ├─ Access: Branch A only                      │ │
│  │ ├─ branchId: "branch-a"                       │ │
│  │ └─ Query Filter: businessId + branchId        │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ CASHIER (Branch A)                            │ │
│  │ ├─ Access: Branch A only                      │ │
│  │ ├─ branchId: "branch-a"                       │ │
│  │ └─ Query Filter: businessId + branchId        │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ SUPER_ADMIN                                   │ │
│  │ ├─ Access: Summary data only                  │ │
│  │ ├─ branchId: null (cross-branch)              │ │
│  │ └─ Query Filter: Aggregate views              │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Action Matrix

```
CASHIER
  └─ POS: CREATE (sales), VIEW (history)
  └─ INVENTORY: VIEW only
  └─ CUSTOMERS: CREATE (during POS), VIEW
  └─ PAYMENTS: CREATE (customer payments), VIEW
  └─ REPORTS: VIEW (limited to their warehouse)

MANAGER
  └─ Can do everything except:
     └─ Cannot create/disable branches
     └─ Cannot manage users/roles
     └─ Cannot access settings
  └─ All actions limited to assigned warehouse

OWNER
  └─ Can do everything:
     └─ CREATE/UPDATE/DELETE any resource
     └─ Enable/Disable branches
     └─ Manage users and roles
     └─ Configure settings
     └─ Access all branches and data

SUPER_ADMIN
  └─ Can only VIEW:
     └─ Branches (status, count, list)
     └─ Users (count, list, roles)
     └─ Reports (aggregated data)
     └─ Dashboard (overview)
```

## Code Usage

### In Components
```typescript
import { Protected, OwnerOnly, ManagerAndAbove } from "@/components/protected";

// Restrict to role
<Protected resource="branches" action="update">
  <EditBranch />
</Protected>

// Owner only
<OwnerOnly>
  <ManageBranches />
</OwnerOnly>

// Manager and above
<ManagerAndAbove>
  <ViewInventory />
</ManagerAndAbove>
```

### In API Routes
```typescript
import { withAuth, applyBranchFilter } from "@/lib/api-auth";

export const GET = withAuth(async (req, authContext) => {
  // User is authenticated
  const query = { where: { businessId: authContext.businessId } };
  
  // Filter by branch if MANAGER/CASHIER
  applyBranchFilter(query.where, authContext);
  
  // authContext includes: userId, businessId, branchId, role
});
```

### Permission Checks
```typescript
import { hasPermission } from "@/lib/rbac";
import { usePermission } from "@/lib/client-auth";

// Server-side
const canDelete = hasPermission("OWNER", "products", "delete");

// Client-side
const userCan = usePermission("products", "update");
```

## Special Features

### 🔧 Owner Only
- ⭐ **Enable/Disable Branches** - Can turn branches on/off
- 👥 **Manage Users** - Create, edit, delete employees
- 🔑 **Manage Roles** - Assign roles to users
- 🏢 **Create Branches** - Add new warehouse/branch
- ⚙️ **Settings** - Configure business settings

### 👁️ Super Admin Only
- 📊 **Employee Count** - View total employees per branch
- 🏢 **Branch Overview** - See all branches and status
- 📈 **Reports** - View aggregated data (view-only)
- 🎯 **Strategic View** - High-level business overview

### 🚫 Cashier Restrictions
- Cannot create/edit products
- Cannot access branch management
- Cannot manage other users
- Cannot access supplier management
- Cannot access expense tracking
- Limited to assigned warehouse only

## API Endpoint Protection Example

```typescript
// GET /api/products - MANAGER and above
export const GET = withAuth(async (req, authContext) => {
  if (!["OWNER", "MANAGER"].includes(authContext.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  // Return products
});

// POST /api/branches - OWNER only
export const POST = withAuth(async (req, authContext) => {
  if (authContext.role !== "OWNER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  // Create branch
});

// PATCH /api/branches/[id]/toggle - OWNER only (enable/disable)
export const PATCH = withAuth(async (req, authContext) => {
  if (authContext.role !== "OWNER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  // Toggle branch status
});
```

---

✨ **This structure ensures:**
- Clear role boundaries
- Data isolation between branches
- Scalable permission management
- Easy to understand and audit
- Type-safe implementation
