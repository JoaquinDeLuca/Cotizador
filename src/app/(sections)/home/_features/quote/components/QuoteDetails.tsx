import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Table, Divider, Spin, Button } from "antd";
import { getQuoteById } from "../actions";
import { quotationTypeMapLabels } from "@/app/constants/optionsSelects";
import { calculateTotals } from "@/app/utils/functions";
import type { PlainQuotesDetails } from "../quote-types";
import { EditFilled } from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface Props {
  quoteId: number;
}

export default function QuoteDetails({ quoteId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PlainQuotesDetails | null>(null);
  const router = useRouter();

  // Get detalles de la cotización
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const res = await getQuoteById(quoteId);

      if (res.success) {
        setData(res?.data as unknown as PlainQuotesDetails);
      }

      setIsLoading(false);
    })();
  }, [quoteId]);

  // Funcion para calcular totales
  const { ivaAmount, subtotal, total } = calculateTotals(
    data?.items || [],
    Number(data?.taxRate) || 0
  );

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spin tip="Cargando datos..." size="large">
          <p className="p-52"></p>
        </Spin>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Empresa */}
      <div className="p-4 rounded-lg shadow-sm border border-accent-light-hover">
        <h2 className="text-lg font-semibold mb-3">Empresa</h2>
        <p className="text-sm text-neutral-strong font-medium">
          Nombre: {data?.company.companyName} - {data?.company.country}
        </p>
        <p className="text-sm">
          <span className="text-sm font-medium text-neutral-mild">CUIT:</span>{" "}
          {data?.company.cuit}
        </p>
        <Divider style={{ margin: 8 }} />
        <p className="text-sm">
          <span className="text-sm font-medium text-neutral-mild">Email:</span>{" "}
          {data?.company.email}
        </p>
        <p className="text-sm">
          <span className="text-sm font-medium text-neutral-mild">
            Teléfono:
          </span>{" "}
          {data?.company.phone}
        </p>
      </div>

      {/* Cliente y cotización */}
      <div className="p-4 rounded-lg shadow-sm border border-accent-light-hover space-y-2">
        <h2 className="text-lg font-semibold mb-3">Cliente</h2>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-strong">Nombre</p>
            <p className="text-sm">
              {data?.client?.type === "COMPANY"
                ? data?.client?.companyName
                : data?.client?.fullName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-strong">CUIT</p>
            <p className="text-sm">{data?.client?.cuit}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-strong">Fecha</p>
            <p className="text-sm">
              {dayjs(data?.quotationDate).format("DD/MM/YYYY")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-strong">
              Productos / Servicios
            </p>
            <p className="text-sm">{data && data?.items.length + 1}</p>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="p-4 rounded-lg shadow-sm border border-accent-light-hover">
        <h4 className="text-lg font-semibold mb-2">Productos / Servicios</h4>
        <div className="rounded-lg overflow-hidden border border-neutral-light">
          <Table
            className="text-sm"
            dataSource={
              data && data?.items.length > 0
                ? data.items.map((item) => ({
                    key: item.id,
                    name: item.productName,
                    quantity: item.quantity,
                    unitPrice: Number(item.unitPrice),
                    total: Number(item.unitPrice) * item.quantity,
                  }))
                : []
            }
            columns={[
              { title: "Producto", dataIndex: "name" },
              { title: "Cantidad", dataIndex: "quantity" },
              {
                title: "Precio Unit.",
                dataIndex: "unitPrice",
                render: (val) => `$${val.toFixed(2)}`,
              },
              {
                title: "Total",
                dataIndex: "total",
                render: (val) => `$${val.toFixed(2)}`,
              },
            ]}
            rowHoverable={false}
            pagination={false}
            size="small"
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>

      {/* Resumen Financiero */}
      <div className="bg-accent-light-m p-4 rounded-lg shadow-inner">
        <div className="text-right space-y-1">
          <div className="flex justify-between items-center">
            <p className="text-neutral-strong text-lg">Subtotal</p>
            <p className="text-neutral-strong">${subtotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-neutral-strong text-lg">
              {data?.quotationType &&
                quotationTypeMapLabels[data.quotationType]}
            </p>
            <p className="text-neutral-strong">${ivaAmount.toFixed(2)}</p>
          </div>
          <Divider />
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold">Total:</p>
            <p className="text-xl font-bold">${total.toFixed(2)}</p>
          </div>
        </div>
      </div>
      <div className="text-right">
        <Button
          type="primary"
          className="mt-3"
          onClick={() => router.push(`/home/quotes/edit/${data?.id}`)}
          icon={<EditFilled />}
        >
          Editar
        </Button>
      </div>
    </div>
  );
}
