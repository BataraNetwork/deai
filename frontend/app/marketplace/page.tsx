import ModelList from "@/components/marketplace/model-list";
import Link from "next/link";

export default function Marketplace() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Model Marketplace</h1>
        <Link href="/marketplace/register" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Register New Model
        </Link>
      </div>
      <p className="mb-8 text-lg text-gray-600">
        Discover, evaluate, and integrate powerful AI models from the community.
      </p>
      <ModelList />
    </div>
  );
}
