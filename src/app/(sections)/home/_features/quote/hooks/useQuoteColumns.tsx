import { Button, Tooltip, Tag, Space, Popconfirm } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SendOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import QuoteSend from "../components/QuoteSend";
import QuoteDetails from "../components/QuoteDetails";
import { ToastOptions } from "@/app/hooks/useToast";
import dayjs from "dayjs";
import type { PlainQuotesWithRelations } from "../quote-types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteQuote } from "../actions";
import { quoteStatusMapLabels, TabName } from "@/app/constants/optionsSelects";
import { getColorStatus } from "@/app/utils/functions";

interface Props {
  handleOpenModal: (
    title: string | React.ReactNode,
    content: React.ReactNode
  ) => void;
  showToast: (options: ToastOptions) => void;
}

export function useQuotesColumns({ handleOpenModal, showToast }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // DELETE quote
  const handleDeleteQuote = async (id: number) => {
    setIsLoading(true);
    const response = await deleteQuote(id);

    showToast({
      type: response.success ? "success" : "error",
      message: response.message,
    });

    router.replace(`/home?tab=${TabName.quote}`);
    setIsLoading(false);
  };

  const columns: ColumnsType<PlainQuotesWithRelations> = [
    {
      title: "ID Cotización",
      dataIndex: "id",
      key: "id",
      render: (_, record) => <p>{record.quotationIdentifier ?? ""}</p>,
    },
    {
      title: "Cliente / Empresa",
      dataIndex: "client",
      key: "client",
      render: (_, record) => (
        <p>{record.client?.companyName || record.client?.fullName}</p>
      ),
    },
    {
      title: "CUIT",
      dataIndex: "cuit",
      key: "cuit",
      render: (_, record) => <p>{record.client?.cuit}</p>,
    },
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      render: (_, record) => (
        <p>{dayjs(record.quotationDate).format("DD-MM-YYYY")}</p>
      ),
    },
    {
      title: "Monto",
      dataIndex: "monto",
      key: "monto",
      render: (_, record) => (
        <p className="font-medium">
          {record.currency.value} ${record.totalAmount.toFixed(2)}
        </p>
      ),
    },
    {
      title: "Estado",
      key: "estado",
      dataIndex: "estado",
      render: (_, { status }) => {
        return (
          <Tag color={getColorStatus(status)} style={{ borderRadius: "1rem" }}>
            {quoteStatusMapLabels[status]}
          </Tag>
        );
      },
    },
    {
      title: "Acciones",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Ver Detalles">
            <Button
              color="primary"
              variant="outlined"
              icon={<EyeOutlined />}
              onClick={() =>
                handleOpenModal(
                  <div className="flex justify-between items-center pr-8 mb-4">
                    <span>Detalles de la Cotización</span>
                    <Tag
                      color={getColorStatus(record.status)}
                      style={{ borderRadius: ".4rem" }}
                    >
                      {quoteStatusMapLabels[record.status]}
                    </Tag>
                  </div>,
                  <QuoteDetails quoteId={record.id} />
                )
              }
            />
          </Tooltip>
          <Tooltip title="Enviar - próximamente">
            <Button
              color="primary"
              variant="outlined"
              icon={<SendOutlined />}
              onClick={() =>
                handleOpenModal(
                  `Enviar Mensaje - ${
                    record.client?.companyName || record.client?.fullName
                  }`,
                  <QuoteSend />
                )
              }
              disabled
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              color="primary"
              variant="outlined"
              icon={<EditOutlined />}
              onClick={() => router.push(`/home/quotes/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="Eliminar"
              description="¿Estás seguro de que deseas eliminar esta cotización?"
              onConfirm={() => handleDeleteQuote(record.id)}
              cancelText="Cancelar"
              okText="Eliminar"
              okButtonProps={{
                disabled: isLoading,
                loading: isLoading,
              }}
            >
              <Button
                color="primary"
                variant="outlined"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return { columns };
}
