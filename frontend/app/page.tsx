import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to DeAI</h1>
      <p className="text-lg mb-8">The decentralized AI network</p>
      <Button>Get Started</Button>
    </div>
  );
}