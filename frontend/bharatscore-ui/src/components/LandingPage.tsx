import type { FC } from "react";
import { Button } from "./Button";

const LandingPage: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-center px-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to BharatScore
      </h1>
      <p className="text-gray-500 mb-8">
        Fast, simple and reliable way to get started.
      </p>
      <Button label="Get Started" onClick={() => alert("Get Started clicked!")} />
    </div>
  );
};

export default LandingPage;
