import DashboardLayout from "@/components/layout/DashboardLayout";
import BarChart from "@/components/charts/BarChart";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-4xl font-bold mb-8">Welcome back, Tobias</h1>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <p className="text-gray-500 dark:text-gray-400">Total Revenue</p>
            <p className="text-4xl font-bold mt-2">$48,574</p>
            <p className="text-green-500 mt-2">+12.5% from last month</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <p className="text-gray-500 dark:text-gray-400">Active Users</p>
            <p className="text-4xl font-bold mt-2">2,847</p>
            <p className="text-green-500 mt-2">+8.2% from last month</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <p className="text-gray-500 dark:text-gray-400">Conversion Rate</p>
            <p className="text-4xl font-bold mt-2">3.24%</p>
            <p className="text-red-500 mt-2">-0.4% from last month</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Revenue Overview</h2>
          <BarChart />
        </div>
      </div>
    </DashboardLayout>
  );
}