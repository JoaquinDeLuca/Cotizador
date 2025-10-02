"use client";
import { useState } from "react";
import Link from "next/link";
import { Form, Input, Button, Select } from "antd";
import { useWatch } from "antd/es/form/Form";
import {
  emailRule,
  passwordRule,
  phoneRule,
  requiredRule,
} from "@/app/utils/formRules";
import { Country } from "@prisma/client";
import { CreateCompanyDto } from "@/schemas/company/company.dto";
import { registerCompany } from "../_features/action";
import useToast from "@/app/hooks/useToast";
import { redirect } from "next/navigation";
import {
  CloudUploadOutlined,
  DollarOutlined,
  RocketOutlined,
} from "@ant-design/icons";

const { Option } = Select;

export default function Page() {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const country = useWatch(["country"], form);

  const { contextHolder, showToast } = useToast();

  const onFinish = async (dataForm: CreateCompanyDto) => {
    setIsLoading(true);

    const response = await registerCompany(dataForm);

    showToast({
      type: response.success ? "success" : "error",
      message: response.message,
      onClose: () => (response.success ? redirect("/auth/login") : null),
    });

    setIsLoading(false);
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-screen flex items-center justify-center p-4 bg-accent-light">
        <div className="grid md:grid-cols-2 max-w-6xl w-full rounded-2xl shadow-xl overflow-hidden border border-[#f0f9ff]">
          <div className="p-6 md:p-9 order-2 md:order-1 bg-white">
            <div className="mb-7 text-center md:text-left">
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
            <h2 className="text-2xl font-bold mb-2">Registro de Empresa</h2>
            <p className="mb-8 text-gray-500">
              Comienza creando la cuenta de tu empresa y tu usuario
              administrador.
            </p>
            <div className="w-full">
              <Form
                form={form}
                name="register"
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                initialValues={{
                  country: Country.ARGENTINA,
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Form.Item
                    label="Nombre de la empresa"
                    name="companyName"
                    rules={[
                      {
                        required: true,
                        message: "Ingrese el nombre de la empresa",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Tech Solutions S.A"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Identificador de negocio"
                    name="businessIdentifier"
                    rules={[
                      { required: true, message: "Ingrese el identificador" },
                    ]}
                  >
                    <Input placeholder="323232-1" className="rounded-lg" />
                  </Form.Item>

                  <Form.Item label="País" name="country" rules={[requiredRule]}>
                    <Select
                      placeholder="Selecciona un país"
                      className="rounded-lg"
                    >
                      <Option value="ARGENTINA">Argentina</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Correo corporativo"
                    name="email"
                    rules={[requiredRule, emailRule]}
                  >
                    <Input
                      placeholder="tech@solutions.com"
                      className="rounded-lg"
                    />
                  </Form.Item>
                  {country === "ARGENTINA" && (
                    <Form.Item label="CUIT" name="cuit" rules={[requiredRule]}>
                      <Input placeholder="20123456789" className="rounded-lg" />
                    </Form.Item>
                  )}

                  <Form.Item
                    label="Teléfono"
                    name="phone"
                    rules={[requiredRule, phoneRule]}
                  >
                    <Input placeholder="+549113232323" className="rounded-lg" />
                  </Form.Item>
                </div>

                <div className="col-span-1 md:col-span-2 mt-2">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Usuario inicial (Admin)
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Este usuario será creado como administrador principal del
                    sistema.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Form.Item
                      label="Nombre completo"
                      name={["users", 0, "fullName"]}
                      rules={[requiredRule]}
                    >
                      <Input placeholder="Pepe Paz" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                      label="Correo del usuario"
                      name={["users", 0, "email"]}
                      rules={[requiredRule, emailRule]}
                    >
                      <Input
                        placeholder="peep@corp.com"
                        className="rounded-lg"
                      />
                    </Form.Item>
                  </div>
                  <Form.Item
                    label="Contraseña del usuario admin"
                    name={["users", 0, "password"]}
                    rules={[requiredRule, passwordRule]}
                  >
                    <Input.Password
                      placeholder="********"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </div>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 mt-6"
                  >
                    Registrar
                  </Button>
                </Form.Item>
              </Form>

              <p className="text-center text-sm text-gray-500">
                ¿Ya tenés cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-500 hover:underline"
                >
                  Iniciá sesión
                </Link>
              </p>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center justify-center bg-sky p-12 order-1 md:order-2">
            <div className="space-y-6 text-center">
              <RocketOutlined
                className="text-6xl"
                style={{ color: "#555eee" }}
              />
              <h2 className="text-3xl font-bold ">Potencia tu negocio</h2>
              <p className="max-w-sm">
                Únete a Cotizador Pro y transforma la manera en que gestionas
                tus ventas. Simplifica tus procesos y enfócate en crecer.
              </p>
              <div className="flex justify-center pt-4">
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm w-80">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <CloudUploadOutlined
                      className="text-3xl"
                      style={{ color: "#555eee" }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Centraliza tu información
                    </h3>
                    <p className="text-sm text-gray-500">
                      Todo en un solo lugar, accesible desde donde estés.
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
