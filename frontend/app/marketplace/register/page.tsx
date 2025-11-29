import RegisterModelForm from "@/components/marketplace/register-model-form";

export default function RegisterModelPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Register a New AI Model</h1>
      <p className="mb-8 text-lg text-gray-600">
        Share your model with the community by providing the details below.
      </p>
      <RegisterModelForm />
    </div>
  );
}
