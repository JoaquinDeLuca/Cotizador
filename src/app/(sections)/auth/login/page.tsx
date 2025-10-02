"use client";

import { Form, Input, Button } from "antd";
import { useState } from "react";
import { authMe, login } from "../_features/action";
import useToast from "@/app/hooks/useToast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/app/hooks/useAuthContext";
import {
  DollarOutlined,
  InboxOutlined,
  LoginOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { contextHolder, showToast } = useToast();
  const { setValue } = useAuthContext();
  const router = useRouter();

  const onSubmitData = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setIsLoading(true);

    const response = await login(email, password);

    if (!response.error) {
      const resAuth = await authMe();

      if (!resAuth.success || !resAuth.data)
        throw new Error("AuthMe sin datos");
      // Seteo de la data en el context
      setValue(resAuth.data!);
    }

    showToast({
      type: response.error ? "error" : "success",
      message: response.message,
      onClose: () => (!response.error ? router.replace("/home") : null),
      showProgress: true,
    });

    setIsLoading(false);
  };

  return (
    <>
      {contextHolder}
      <div className="flex flex-col items-center justify-center min-h-screen bg-accent-light">
        <div className="min-h-screen flex items-center justify-center p-4 ">
          <div className="grid md:grid-cols-2 max-w-5xl w-full rounded-2xl shadow-xl overflow-hidden border border-[#f0f9ff]">
            <div className="p-8 md:p-12 order-2 md:order-1 bg-white">
              <div className="mb-10 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <DollarOutlined
                    className="text-3xl"
                    style={{ color: "#555eee" }}
                  />
                  <h1 className="text-3xl font-bold">Cotizador</h1>
                </div>
                <p className="text-gray-500">
                  Gestiona tus clientes, cotizaciones y servicios en un solo
                  lugar.
                </p>
              </div>
              <h2 className="text-2xl font-bold mb-2">Iniciar Sesión</h2>
              <p className="text-gray-500 mb-8">
                Bienvenido de nuevo, ingresa a tu cuenta.
              </p>
              <div className="w-full">
                <Form
                  name="login"
                  layout="vertical"
                  onFinish={onSubmitData}
                  autoComplete="off"
                >
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Por favor ingrese su email" },
                    ]}
                  >
                    <Input
                      className="rounded-lg"
                      placeholder="ejemplo@correo.com"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Contraseña"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Por favor ingrese su contraseña",
                      },
                    ]}
                  >
                    <Input.Password
                      className="rounded-lg"
                      placeholder="********"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      icon={<LoginOutlined />}
                      className="w-full rounded-lg bg-blue-500 hover:bg-blue-600"
                    >
                      Iniciar sesión
                    </Button>
                  </Form.Item>
                </Form>

                <p className="text-center text-sm text-gray-600">
                  ¿No tenés cuenta?{" "}
                  <Link
                    href="/auth/register"
                    className="text-blue-500 hover:underline"
                  >
                    Registrate
                  </Link>
                </p>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center p-12 order-1 md:order-2 bg-sky">
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm w-72">
                  <div className="bg-blue-100 p-4 rounded-full ">
                    <UsergroupAddOutlined
                      className="text-3xl"
                      style={{ color: "#155dfc" }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Clientes</h3>
                    <p className="text-sm text-gray-500">
                      Administra tu cartera
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm w-72 ml-8">
                  <div className="bg-green-100 p-4 rounded-full">
                    <DollarOutlined
                      className="text-3xl"
                      style={{ color: "#00a63e" }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Cotizaciones
                    </h3>
                    <p className="text-sm text-gray-500">
                      Crea y envía presupuestos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm w-72">
                  <div className="bg-purple-200 p-4 rounded-full ">
                    <InboxOutlined
                      className="text-3xl"
                      style={{ color: "#9810fa" }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Productos/Servicios
                    </h3>
                    <p className="text-sm text-gray-500">
                      Gestiona tu catálogo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
