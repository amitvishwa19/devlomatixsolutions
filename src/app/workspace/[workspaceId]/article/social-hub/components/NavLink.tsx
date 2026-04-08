import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useSocialRouter } from "@/social-hub/hooks/use-social-router";

interface NavLinkCompatProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  activeClassName?: string;
  pendingClassName?: string;
  to: string;
  end?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, end, ...props }, ref) => {
    const { currentPath, navigate } = useSocialRouter();
    const isActive = currentPath === to;

    return (
      <a
        ref={ref}
        href="#"
        onClick={(e) => { e.preventDefault(); navigate(to); }}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };