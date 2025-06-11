
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export const navItems = [
  {
    to: "/",
    page: <Index />,
  },
  {
    to: "/settings",
    page: <Settings />,
  },
  {
    to: "*",
    page: <NotFound />,
  },
];
