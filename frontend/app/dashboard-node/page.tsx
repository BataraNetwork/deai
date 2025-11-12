import RegisterNode from "@/components/dashboard-node/register-node";

export default function NodeDashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Node Operator Dashboard</h1>
      <RegisterNode />
      {/* Node performance monitoring and reward claiming will go here */}
    </div>
  );
}