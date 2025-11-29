import ApiKeyManager from "@/components/dashboard/api-key-manager";

export default function ApiKeysPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">API Key Management</h1>
      <p className="mb-8 text-lg text-gray-600">
        Manage your API keys to access the DeAI network services.
      </p>
      <ApiKeyManager />
    </div>
  );
}
