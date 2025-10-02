"use client";
import { Alert, Button } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ErrorStateProps {
  message: string;
  redirectPath?: string;
  buttonText?: string;
}

export default function ErrorState({
  message,
  redirectPath = "/auth/login",
  buttonText = "Validar sesión",
}: ErrorStateProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRedirect = () => {
    setIsLoading(true);
    router.replace(redirectPath);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 min-h-[24rem]">
      <div className="sm:w-1/2 flex flex-col items-center gap-2">
        <h2 className="text-xl font-semibold text-gray-800">
          Ups, algo salió mal
        </h2>
        <Alert message={message} type="error" showIcon />
      </div>
      <Button loading={isLoading} type="primary" onClick={handleRedirect}>
        {buttonText}
      </Button>
    </div>
  );
}
