import Chat from "@/components/chat/chat";

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-100 p-4">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        {/* Token Balance Display and Payment Drawer will go here */}
      </div>
      <div className="w-3/4">
        <Chat />
      </div>
    </div>
  );
}