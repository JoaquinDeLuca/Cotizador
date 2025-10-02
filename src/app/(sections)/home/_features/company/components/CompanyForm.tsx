import { Form, Input, Button } from "antd";
import { useEffect, useState } from "react";
import {
  CloseOutlined,
  MailOutlined,
  SaveOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import useToast from "@/app/hooks/useToast";
import { emailRule, phoneRule } from "@/app/utils/formRules";
import { editCompany, getCompanyById } from "../actions";
import type { EditCompanyDto } from "@/schemas/company/company.dto";

interface Props {
  companyId: number;
  onCloseDrawer: () => void;
}

export default function CompanyForm({ companyId, onCloseDrawer }: Props) {
  const [form] = Form.useForm();
  const { contextHolder, showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  // Una vez que tengo la data hago el set de los datos para el form
  useEffect(() => {
    (async () => {
      if (companyId) {
        const response = await getCompanyById(companyId);

        if (response.success) {
          form.setFieldsValue({
            companyName: response.data?.companyName,
            address: response.data?.address,
            cuit: response.data?.cuit,
            email: response.data?.email,
            phone: response.data?.phone,
          });
        }
      }
    })();
  }, [companyId, form]);

  const onSubmitData = async (dataForm: EditCompanyDto) => {
    setIsLoading(true);

    const response = await editCompany(dataForm, companyId);

    showToast({
      type: response.success ? "success" : "error",
      message: response.message,
    });

    setIsLoading(false);
    onCloseDrawer();
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmitData}
        className="max-w-xl mx-auto p-6 rounded-lg space-y-4"
      >
        <div className="border border-accent-light-active shadow p-4 rounded-lg">
          <p className="flex items-center gap-2 mb-3 font-semibold text-lg">
            <ShopOutlined /> Datos Básicos
          </p>
          <Form.Item label="Nombre de la empresa - cliente" name="companyName">
            <Input placeholder="Nombre de la empresa" />
          </Form.Item>

          <Form.Item label="CUIT" name="cuit">
            <Input placeholder="CUIT" />
          </Form.Item>

          <Form.Item label="Dirección" name="address">
            <Input placeholder="Dirección" />
          </Form.Item>
        </div>

        <div className="border border-accent-light-active shadow p-4 rounded-lg">
          <p className="flex items-center gap-2 mb-3 font-semibold text-lg">
            <MailOutlined /> Datos de contacto
          </p>
          <Form.Item
            label="Correo electrónico"
            name="email"
            rules={[emailRule]}
          >
            <Input placeholder="Correo electrónico" />
          </Form.Item>

          <Form.Item label="Teléfono" name="phone" rules={[phoneRule]}>
            <Input placeholder="Teléfono" />
          </Form.Item>
        </div>

        <div className="flex items-center gap-2 mt-10">
          <Button
            icon={<CloseOutlined />}
            onClick={onCloseDrawer}
            className="w-full"
          >
            Cancelar
          </Button>
          <Button
            icon={<SaveOutlined />}
            className="w-full"
            type="primary"
            htmlType="submit"
            loading={isLoading}
          >
            Guardar
          </Button>
        </div>
      </Form>
    </>
  );
}
