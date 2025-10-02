"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Form, Input, Select, Switch, Table } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { requiredRule } from "@/app/utils/formRules";
import TextArea from "antd/es/input/TextArea";
import { QuotationStatus, QuotationType } from "@prisma/client";
import useToast from "@/app/hooks/useToast";
import type { CreateQuoteDto, EditQuoteDto } from "@/schemas/quote/quote.dto";
import dayjs from "dayjs";
import {
  quotationTypeOptions,
  quotationTypeTaxRate,
  TabName,
} from "@/app/constants/optionsSelects";
import { useAuthContext } from "@/app/hooks/useAuthContext";
import { useProductItemColumns } from "../../../_features/quote/hooks/useProductItemColumns";
import { createQuote, editQuote } from "../../../_features/quote/actions";
import { useRouter } from "next/navigation";
import PreviewPrint from "./PreviewPrint";
import { getClientById } from "../../../_features/client/actions";
import { getCompanyById } from "../../../_features/company/actions";
// import { useWatch } from "rc-field-form";
import debounce from "lodash.debounce";
import { useFetchById } from "@/app/hooks/useFetchById";
import {
  formatPrintClientOptions,
  formatPrintProductsOptions,
  formatPrintStatusOptions,
} from "@/app/utils/formatPrintOptions";
import { useCart } from "../hooks/useCart";
import { useWatch } from "antd/es/form/Form";

interface Props {
  isEdit: boolean;
  dataEdit?: EditQuoteDto;
  optionsProducts: { label: string; value: number }[];
  optionsClients: { label: string; value: number }[];
  optionsCurrencies: { label: string; value: string }[];
}

export default function QuoteForm({
  isEdit,
  dataEdit,
  optionsProducts,
  optionsClients,
  optionsCurrencies,
}: Props) {
  const [form] = Form.useForm<CreateQuoteDto | EditQuoteDto>();

  const router = useRouter();
  const authContext = useAuthContext();
  const { showToast, contextHolder } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  // States data PreviewPrint
  const [previewFormValues, setPreviewFormValues] = useState<
    Partial<CreateQuoteDto>
  >({});
  const [visible, setVisible] = useState({
    serviceDescription: false,
    termsOfPayment: false,
    valGuarantees: false,
    paymentMethods: false,
    exclusions: false,
    tyc: false,
    additionalInfo: false,
  });

  // Escuchar cuando cambie el clientId
  const clientIdWatch = useWatch(["clientId"], form);

  // GET data client - PreviewPrint
  const { data: clientFound, loading: clientLoading } = useFetchById({
    fetchFn: getClientById,
    id: clientIdWatch,
  });

  // GET data company - PreviewPrint
  const { data: companyFound, loading: companyLoading } = useFetchById({
    id: authContext.value.companyId,
    fetchFn: getCompanyById,
  });

  // SELECT: RenderFormatOptions Products And Clients
  const optionsProductsFormat = formatPrintProductsOptions({
    options: optionsProducts,
  });

  const optionsClientsFormat = formatPrintClientOptions({
    options: optionsClients,
  });

  const optionsStatus = formatPrintStatusOptions();

  // Si llega la data setear para el edit
  useEffect(() => {
    if (isEdit && dataEdit) {
      const { items, ...rest } = dataEdit;

      // // Si hay fecha, convertirla a dayjs
      const preparedValues = {
        ...rest,
        quotationDate: rest.quotationDate
          ? dayjs(rest.quotationDate)
          : undefined,
        quotationValidity: rest.quotationValidity
          ? dayjs(rest.quotationValidity)
          : undefined,
        clientId: rest.clientId,
        currencyId: String(rest.currencyId), // Pasamos a string para que lea el input
        taxRate: quotationTypeTaxRate[dataEdit.quotationType],
      };

      // saco los items y me quedo con lo otro nomas
      form.setFieldsValue(preparedValues as unknown as Partial<CreateQuoteDto>);
      // Set para el preview
      setPreviewFormValues(
        preparedValues as unknown as Partial<CreateQuoteDto>
      );

      // construimos dinámicamente el visible en base a lo que viene en rest con !! para convertir a boolean
      const newVisible = {
        serviceDescription: !!rest.serviceDescription,
        termsOfPayment: !!rest.termsOfPayment,
        valGuarantees: !!rest.valGuarantees,
        paymentMethods: !!rest.paymentMethods,
        exclusions: !!rest.exclusions,
        tyc: !!rest.tyc,
        additionalInfo: !!rest.additionalInfo,
      };

      setVisible(newVisible);
    } else {
      form.resetFields();
    }
  }, [dataEdit, isEdit, form]);

  // Mapeo los product a el tipo del carrito
  const productOptionMapToCart = () => {
    return optionsProductsFormat.map((item) => ({
      sku: item.sku,
      productId: Number(item.value),
      productName: item.name,
      quantity: 1,
      unitPrice: Number(item.price),
    }));
  };

  const { addProduct, items, removeItem, updateItem } = useCart(
    isEdit ? dataEdit!.items : productOptionMapToCart(),
    isEdit
  );

  const productItemColumns = useProductItemColumns(updateItem, removeItem);

  const onSubmitData = async (dataForm: CreateQuoteDto | EditQuoteDto) => {
    setIsLoading(true);

    // Format Data send
    const dataSend = {
      ...dataForm,
      items: items, // Agregamos los items del state
      clientId: Number(dataForm.clientId),
      currencyId: Number(dataForm.currencyId),
      quotationDate: dayjs(dataForm.quotationDate).toISOString(), // pasar a string asi no tira errors sa
      quotationValidity: dayjs(dataForm.quotationValidity).toISOString(),
    };

    const response =
      isEdit && dataEdit
        ? await editQuote(dataSend as EditQuoteDto, dataEdit!.id!)
        : await createQuote(dataSend);

    showToast({
      type: response.success ? "success" : "error",
      message: response.message,
      onClose: () =>
        response.success && router.push(`/home?tab=${TabName.quote}`),
      duration: 1.5,
    });

    setIsLoading(false);
    if (response.success) form.resetFields();
  };

  // Toggle Switch para campos adicionales
  const toggleField = (field: keyof typeof visible, checked: boolean) => {
    if (!checked) {
      // Limpiar estado para preview
      setPreviewFormValues((prev) => ({ ...prev, [field]: "" }));
    }

    setVisible((prev) => ({ ...prev, [field]: checked }));
  };

  // Selecciónar el tipo de cotización / IVA y asiganar el taxRate correspondiente
  const onChangeSelect = (value: QuotationType) => {
    const defaultTaxRate = quotationTypeTaxRate[value];

    form.setFieldValue("taxRate", defaultTaxRate);
    setPreviewFormValues((prev) => ({ ...prev, taxRate: defaultTaxRate }));
  };

  // Función debounced que actualiza los campos recibidos con memo. para evitar delay al escribir
  const updatePreview = useMemo(
    () =>
      debounce((changes: Partial<CreateQuoteDto>) => {
        setPreviewFormValues((prev) => ({ ...prev, ...changes }));
      }, 160),
    [setPreviewFormValues]
  );

  // onValuesChange del form
  const onValuesChange = (changedValues: Partial<CreateQuoteDto>) => {
    updatePreview(changedValues); // solo pasamos los campos que cambiaron
  };

  return (
    <>
      {contextHolder}
      <div className="pr-4 w-full mx-auto md:w-5/12 ">
        <div className="flex flex-col gap-4 items-center md:flex-row md:justify-between md:items-start mb-7 border-gray-200 bg-accent-light p-4 rounded-lg">
          <Button
            icon={<ArrowLeftOutlined className="cursor-pointer" />}
            variant="solid"
            color="primary"
            onClick={() => router.back()}
          >
            Volver
          </Button>
          <h2 className="text-xl font-semibold text-indigo-600">
            {isEdit
              ? `Editar cotización: ${dataEdit?.quotationIdentifier ?? ""}`
              : "Nueva cotización"}
          </h2>
        </div>
        <Form
          form={form}
          key={isEdit ? "edit-quote-form" : "create-quote-form"}
          name={isEdit ? "edit-quote-form" : "create-quote-form"}
          layout="vertical"
          onFinish={onSubmitData}
          onValuesChange={onValuesChange}
          initialValues={{
            status: QuotationStatus.DRAFT,
            companyId: authContext.value.companyId,
            quotationDate: dayjs(), // Fecha actual por defecto
            quotationValidity: null,
            quotationIdentifier: "",
          }}
          scrollToFirstError={{
            behavior: "smooth",
            block: "center",
          }}
        >
          <Form.Item name="status" hidden>
            <Input type="hidden" name="status" />
          </Form.Item>
          <Form.Item name="companyId" hidden>
            <Input type="hidden" name="companyId" />
          </Form.Item>
          <div className="flex flex-col gap-10 md:flex-col md:overflow-x-auto  md:justify-start">
            <div className="w-full">
              <p className="text-lg font-semibold mb-3">Datos</p>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between lg:gap-4">
                {isEdit && (
                  <Form.Item
                    label="Estado"
                    name="status"
                    className="w-full"
                    rules={[requiredRule]}
                  >
                    <Select
                      placeholder={"Selecciona el estado"}
                      options={optionsStatus}
                      notFoundContent="No hay resultados."
                      allowClear
                    />
                  </Form.Item>
                )}
                <Form.Item
                  label="Tipo de cotización"
                  name="quotationType"
                  rules={[requiredRule]}
                  className="w-full"
                >
                  <Select
                    placeholder="Tipo de cotización"
                    options={quotationTypeOptions}
                    onChange={onChangeSelect}
                  />
                </Form.Item>
                <Form.Item
                  name="taxRate"
                  style={{
                    display: "none",
                    marginTop: 20,
                  }}
                  normalize={(value: string) => Number(value)}
                >
                  <Input placeholder="IVA" />
                </Form.Item>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between lg:gap-4">
                <Form.Item
                  label="Tipo de divisa"
                  name="currencyId"
                  rules={[requiredRule]}
                  className="w-full"
                >
                  <Select
                    placeholder="Seleccione de divisa"
                    options={optionsCurrencies}
                  />
                </Form.Item>
                <Form.Item
                  label="ID Cotización"
                  name="quotationIdentifier"
                  className="w-full"
                  normalize={(value: string) => value?.toUpperCase()}
                >
                  <Input placeholder="ID Cotización" />
                </Form.Item>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-4">
                <Form.Item
                  label="Fecha de emisión"
                  name="quotationDate"
                  className="w-full"
                  rules={[requiredRule]}
                >
                  <DatePicker
                    placeholder="Selecciona una fecha"
                    className="w-full"
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item
                  label="Válida hasta"
                  name="quotationValidity"
                  className="w-full"
                >
                  <DatePicker
                    placeholder="Cotización válida hasta"
                    className="w-full"
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </div>

              <div className="flex flex-col">
                <Form.Item
                  label={
                    <span className="text-lg font-semibold">
                      Cliente / Empresa
                    </span>
                  }
                  name="clientId"
                  rules={[requiredRule]}
                >
                  <Select
                    placeholder="Selecciona un cliente: Busca por Nombre o CUIT"
                    options={optionsClientsFormat}
                    notFoundContent="No hay resultados."
                    showSearch
                    filterOption={(input, option) =>
                      (option?.searchValue ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    allowClear
                  />
                </Form.Item>
                <div className="mb-3 w-full flex flex-col gap-1">
                  <span className="text-lg font-semibold ">
                    Productos / Servicios
                  </span>
                  <Select
                    showSearch
                    placeholder="Selecciona los productos: Busca por Nombre o SKU"
                    filterOption={(input, option) =>
                      typeof option?.searchValue === "string" &&
                      option.searchValue
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={optionsProductsFormat}
                    onSelect={(value) => {
                      addProduct(Number(value));
                    }}
                    value={null}
                  />
                </div>

                <div>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Productos seleccionados
                    </h3>

                    <div className="border rounded-lg z-10 border-gray-200">
                      <Table
                        rowKey="productId"
                        className=" rounded-lg"
                        columns={productItemColumns}
                        dataSource={items}
                        pagination={false}
                        rowHoverable={false}
                        locale={{
                          emptyText: "No hay productos seleccionados todavía",
                        }}
                        scroll={{ x: "max-content" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <div className="bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between p-3">
                    <span className="font-medium">
                      Descripción del servicio
                    </span>
                    <Switch
                      checked={visible.serviceDescription}
                      onChange={(checked) =>
                        toggleField("serviceDescription", checked)
                      }
                    />
                  </div>

                  <Form.Item
                    name="serviceDescription"
                    key={`serviceDescription-${visible.serviceDescription}`}
                    style={{
                      margin: 4,
                      padding: 4,
                    }}
                    hidden={!visible.serviceDescription}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Ingrese la descripción del servicio"
                    />
                  </Form.Item>
                </div>

                <div className="bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between p-3">
                    <span className="font-medium">Condiciones de pago</span>
                    <Switch
                      checked={visible.termsOfPayment}
                      onChange={(checked) =>
                        toggleField("termsOfPayment", checked)
                      }
                    />
                  </div>

                  <Form.Item
                    name="termsOfPayment"
                    style={{ margin: 4, padding: 4 }}
                    hidden={!visible.termsOfPayment}
                    key={`termsOfPayment-${visible.serviceDescription}`}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Ingrese las condiciones de pago"
                    />
                  </Form.Item>
                </div>

                <div className="bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between p-3">
                    <span className="font-medium">Validez y garantías</span>
                    <Switch
                      checked={visible.valGuarantees}
                      onChange={(checked) =>
                        toggleField("valGuarantees", checked)
                      }
                    />
                  </div>
                  <Form.Item
                    name="valGuarantees"
                    style={{ margin: 4, padding: 4 }}
                    hidden={!visible.valGuarantees}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Ingrese la validez y garantías"
                      className="mt-3"
                    />
                  </Form.Item>
                </div>

                <div className="bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between p-3">
                    <span className="font-medium">Métodos de pago</span>
                    <Switch
                      checked={visible.paymentMethods}
                      onChange={(checked) =>
                        toggleField("paymentMethods", checked)
                      }
                    />
                  </div>
                  <Form.Item
                    name="paymentMethods"
                    style={{ margin: 4, padding: 4 }}
                    hidden={!visible.paymentMethods}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Ingrese los métodos de pago"
                      className="mt-3"
                    />
                  </Form.Item>
                </div>

                <div className="bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between p-3">
                    <span className="font-medium">Exclusiones</span>
                    <Switch
                      checked={visible.exclusions}
                      onChange={(checked) => toggleField("exclusions", checked)}
                    />
                  </div>
                  <Form.Item
                    name="exclusions"
                    style={{ margin: 4, padding: 4 }}
                    hidden={!visible.exclusions}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Ingrese las exclusiones"
                      className="mt-3"
                    />
                  </Form.Item>
                </div>

                <div className="bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between p-3">
                    <span className="font-medium">Información adicional</span>
                    <Switch
                      checked={visible.additionalInfo}
                      onChange={(checked) =>
                        toggleField("additionalInfo", checked)
                      }
                    />
                  </div>

                  <Form.Item
                    name="additionalInfo"
                    style={{ margin: 4, padding: 4 }}
                    hidden={!visible.additionalInfo}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Ingrese información adicional"
                      className="mt-3"
                    />
                  </Form.Item>
                </div>

                <div className="bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between p-3">
                    <span className="font-medium">Términos y condiciones</span>
                    <Switch
                      checked={visible.tyc || dataEdit?.tyc ? true : false}
                      onChange={(checked) => toggleField("tyc", checked)}
                    />
                  </div>

                  <Form.Item
                    name="tyc"
                    style={{ margin: 4, padding: 4 }}
                    hidden={!visible.tyc}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Ingrese los términos y condiciones"
                      className="mt-3"
                    />
                  </Form.Item>
                </div>

                <Form.Item label="Nota" name="note" className="mb-4 ">
                  <TextArea
                    placeholder="Condiciones comerciales, terminos de pago, etc."
                    maxLength={300}
                    rows={3}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            type="primary"
            htmlType="submit"
            loading={isLoading}
            icon={<SaveOutlined />}
          >
            {isEdit ? "Guardar cambios" : "Crear cotización"}
          </Button>
        </Form>
      </div>

      <div className="hidden md:block md:border-l-2 md:border-accent-light" />

      <div className="hidden md:block mx-auto">
        <PreviewPrint
          data={previewFormValues}
          client={clientFound}
          clientLoading={clientLoading}
          company={companyFound}
          companyLoading={companyLoading}
          items={items}
          optionsCurrencies={optionsCurrencies}
        />
      </div>
    </>
  );
}
