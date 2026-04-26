import { Outlet, useLocation, useNavigate } from "react-router";
import { Show, UserButton } from "@clerk/react";
import { useCartStore } from "@/store/cart";
import { LayoutDashboard, Package, ShoppingCart, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export function ProtectedLayout({ role }: { role: "ADMIN" }) {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            <button onClick={() => navigate("/")} className="text-xl font-bold text-gray-900">
              TokoKu
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Show when="signed-in">
              <UserButton afterSignOutUrl="/" />
            </Show>
            <Show when="signed-out">
              <button onClick={() => navigate("/login")} className="text-sm text-blue-600 hover:underline">
                Login
              </button>
            </Show>
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white border-r min-h-screen transition-all duration-300 flex flex-col",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <nav className="flex-1 p-3">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={<item.icon className="w-5 h-5" />}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </nav>

          {/* Collapse toggle at bottom */}
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className={cn("w-full justify-center", !collapsed && "justify-start gap-2")}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-xs">Collapse</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, label, icon, collapsed }: { href: string; label: string; icon: React.ReactNode; collapsed: boolean }) {
  const { pathname } = useLocation();
  const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-100",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </a>
  );
}