# RBAC Quick Reference Guide

## 🎯 Quick Permission Check

### For Pages/Components

```typescript
import { Protected, IfPermitted, OwnerOnly } from "@/components/protected";

// Option 1: Wrap entire component
<Protected resource="products" action="delete">
  <DeleteButton />
</Protected>

// Option 2: Show/hide elements
<IfPermitted resource="products" action="update">
  <EditButton />
</IfPermitted>

// Option 3: Role-based components
<OwnerOnly>
  <BranchSettings />
</OwnerOnly>
```

### For API Routes

```typescript
import { withAuth, getAuthContext } from "@/lib/api-auth";

export const POST = withAuth(async (req, authContext) => {
  // authContext has: userId, businessId, branchId, role
  // Proceed with authorization checked
});
```

---

## 📋 Role Permissions at a Glance

### CASHIER 🏪
- POS Billing: ✅ Create, View
- Inventory: ✅ View
- Customers: ✅ Create, View
- Payments: ✅ Create, View
- Reports: ✅ View
- **Branch Limited**: Only sees their warehouse data
- **Cannot**: Create products, manage branches, manage users

### MANAGER 📊
- All CASHIER features
- Products: ✅ Create, View, Update
- Purchases: ✅ Full
- Inventory: ✅ Full (with branch filter)
- Expenses: ✅ Full
- Branches: ✅ View (assigned only)
- Users: ✅ View (assigned branch only)
- **Cannot**: Create/disable branches, manage roles

### OWNER 👑
- All MANAGER features
- Branches: ✅ Create, View, Update, Delete, **Enable/Disable** ⭐
- Users: ✅ Create, View, Update, Delete
- Roles & Permissions: ✅ Manage
- Settings: ✅ Configure
- **Can**: Everything in the system

### SUPER_ADMIN 🛡️
- Dashboard: ✅ View only
- Branches: ✅ View only
- Users: ✅ View employee list only
- Reports: ✅ View statistics
- **Limited View**: Oversight role, very restricted

---

## 🔧 Common Tasks

### Task 1: Restrict Page to Owner Only

```typescript
// app/dashboard/settings/page.tsx
"use client";
import { useUser } from "@/lib/client-auth";

export default function SettingsPage() {
  const user = useUser();

  if (user?.role !== "OWNER") {
    return <div>Only owners can access settings</div>;
  }

  return <SettingsForm />;
}
```

### Task 2: Protect API for Manager Only

```typescript
// app/api/inventory/adjust/route.ts
import { withAuth } from "@/lib/api-auth";

export const POST = withAuth(async (req, authContext) => {
  if (!["OWNER", "MANAGER"].includes(authContext.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Process adjustment
});
```

### Task 3: Show/Hide Button Based on Role

```typescript
// components/product-card.tsx
"use client";
import { IfPermitted } from "@/components/protected";

export function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      
      <IfPermitted resource="products" action="update">
        <button>Edit</button>
      </IfPermitted>

      <IfPermitted resource="products" action="delete">
        <button>Delete</button>
      </IfPermitted>
    </div>
  );
}
```

### Task 4: Filter Data by Branch

```typescript
// app/api/sales/route.ts
import { withAuth, applyBranchFilter } from "@/lib/api-auth";

export const GET = withAuth(async (req, authContext) => {
  const query: any = {
    where: {
      businessId: authContext.businessId,
    },
  };

  // This automatically adds branchId filter for MANAGER/CASHIER
  applyBranchFilter(query.where, authContext);

  const sales = await db.sale.findMany(query);
  return Response.json(sales);
});
```

---

## 🚀 Implementing New Features

### Checklist for New Feature

- [ ] Define which roles can access (add to RBAC permissions)
- [ ] Add route to `navigationConfig` with correct roles
- [ ] Protect API endpoints with `withAuth`
- [ ] Use `Protected` component on UI elements
- [ ] Apply `applyBranchFilter` for multi-branch data
- [ ] Test with each role
- [ ] Add to RBAC documentation

---

## 🔍 Debugging Tips

### Check User Permissions
```typescript
const user = useUser();
console.log("User Role:", user?.role);
console.log("Branch:", user?.branchId);
```

### Test Permission
```typescript
import { hasPermission } from "@/lib/rbac";

const canDelete = hasPermission("OWNER", "products", "delete");
console.log("Can delete products:", canDelete);
```

### Check Accessible Routes
```typescript
import { getAllowedRoutes } from "@/lib/rbac";

const routes = getAllowedRoutes("MANAGER");
console.log("Manager can access:", routes);
```

---

## 📊 Permission Reference Matrix

| Action | CASHIER | MANAGER | OWNER | SUPER_ADMIN |
|--------|---------|---------|-------|-------------|
| View Dashboard | ❌ | ✅ | ✅ | ✅ |
| Create Sale | ✅ | ✅ | ✅ | ❌ |
| Adjust Stock | ❌ | ✅ | ✅ | ❌ |
| Create Product | ❌ | ❌ | ✅ | ❌ |
| Create Branch | ❌ | ❌ | ✅ | ❌ |
| Enable/Disable Branch | ❌ | ❌ | ✅ | ❌ |
| Manage Users | ❌ | ❌ | ✅ | ❌ |
| View Users | ❌ | ❌ | ✅ | ✅ |
| View Branch Stats | ❌ | ❌ | ✅ | ✅ |
| Edit Settings | ❌ | ❌ | ✅ | ❌ |

---

## ⚠️ Important Security Notes

1. **Always verify on backend**: Never trust client-side permission checks
2. **Database filtering**: Always include `businessId` in all queries
3. **Branch isolation**: Use `branchId` filter for MANAGER/CASHIER
4. **Sensitive data**: Never return password hashes or personal data
5. **Audit logging**: Log sensitive operations (user creation, branch changes)

---

## 📞 Support

For implementation questions, refer to:
- `RBAC_IMPLEMENTATION.md` - Full documentation
- `src/lib/rbac.ts` - Permission definitions
- `src/lib/api-auth.ts` - API utilities
- `src/lib/client-auth.ts` - Client utilities
- `src/components/protected.tsx` - UI components
