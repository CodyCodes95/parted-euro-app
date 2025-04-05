import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/server";

export default async function AdminDashboardPage() {
  // Fetch analytics data using the correct tRPC server api
  const analytics = await api.analytics.getDailyStats();
  const pendingOrdersCount = await api.analytics.getPendingOrdersCount();

  return (
    <div className="container p-6">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Page Visits Today</CardTitle>
            <CardDescription>Total website visits today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.pageVisitsCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listing Views Today</CardTitle>
            <CardDescription>
              Product views in the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.listingViewCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
            <CardDescription>Orders with "Paid" status</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingOrdersCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
