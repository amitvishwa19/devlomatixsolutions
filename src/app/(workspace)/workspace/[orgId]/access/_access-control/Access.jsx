import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAccessContext } from "./AccessContext";

export function Access({
  permission,
  permissions,
  role,
  requireAll = false,
  fallback = null,
  tooltip,
  debug = false,
  children,
}) {
  const access = useAccessContext();

  if (!access) return fallback;

  let allowed = true;

  if (role && !access.hasRole(role)) allowed = false;
  if (permission && !access.hasPermission(permission)) allowed = false;

  if (permissions?.length) {
    allowed = requireAll
      ? access.hasAllPermissions(permissions)
      : access.hasAnyPermission(permissions);
  }

  if (!allowed) {
    if (debug && process.env.NODE_ENV === "development") {
      console.group("[AccessControl] Access denied");
      console.log("role:", role);
      console.log("permission:", permission);
      console.log("permissions:", permissions);
      console.log("user roles:", access.roles);
      console.log("user permissions:", [...access.permissions]);
      console.groupEnd();
    }

    return tooltip ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block opacity-50 cursor-not-allowed">
            {fallback}
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    ) : fallback;
  }

  return children;
}