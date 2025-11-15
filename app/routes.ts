import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/reports", "routes/api.reports.ts"),
] satisfies RouteConfig;
