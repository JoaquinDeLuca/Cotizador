"use client";
import { Select, Tooltip } from "antd";
import CardData from "@/app/components/CardData";
import CompanyDrawer from "./company/components/CompanyDrawer";
import {
  CheckCircleOutlined,
  DollarOutlined,
  QuestionCircleOutlined,
  UsergroupAddOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import ErrorState from "@/app/components/ErrorState";
import { getStats } from "./actions";
import { useEffect, useState } from "react";

interface Props {
  optionsCurrencies: { label: string; value: string }[];
}

export interface StatItem {
  label: string;
  value: string | number;
  currency: string | null;
  change: number | null;
}

export interface StatsResponse {
  success: boolean;
  data: StatItem[];
  message: string;
}

export default function SectionTop({ optionsCurrencies }: Props) {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const icons = [
    { component: DollarOutlined, color: "#8c5cf6" },
    { component: CheckCircleOutlined, color: "#12b981" },
    { component: WalletOutlined, color: "#ec4899" },
    { component: UsergroupAddOutlined, color: "#0e9ee3" },
  ];

  // Función para buscar datos por moneda
  const fetchStats = async (currencyId?: string) => {
    setIsLoading(true);
    try {
      const response = await getStats(currencyId);
      setData(response);
    } catch (error) {
      const message =
        (error as Error).message ||
        "Error: No se pudieron obtener estadísticas";
      setData({
        success: false,
        data: [],
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchStats();
  }, []);

  const handleCurrencyChange = (currencyId: string) => fetchStats(currencyId);

  return (
    <>
      <section className="w-full bg-[#f7f7f8] ">
        <div className="w-full max-w-7xl mx-auto p-4">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold">Panel de control</h1>
            <div className="flex items-center gap-4">
              <Select
                placeholder="Divisa"
                size="small"
                options={optionsCurrencies}
                onChange={handleCurrencyChange}
              />
              <Tooltip title="Datos de los últimos 30 días">
                <QuestionCircleOutlined />
              </Tooltip>
              <div className="flex justify-end">
                {/* Form de empresa */}
                <CompanyDrawer />
              </div>
            </div>
          </div>

          {/* Cards */}
          {data && !data.success ? (
            <ErrorState message={data.message} />
          ) : (
            <div className="my-10 flex justify-center items-center gap-5 flex-wrap">
              {(data?.data ?? Array(4).fill(undefined)).map((item, idx) => {
                const Icon = icons[idx % icons.length].component;
                const color = icons[idx % icons.length].color;

                // Creamos un bg clarito con opacidad
                const bgColor = `${color}20`;

                return (
                  <CardData
                    key={idx}
                    icon={
                      <Icon
                        className="text-xl bg-green-100 p-2 rounded-full"
                        style={{ color, backgroundColor: bgColor }}
                      />
                    }
                    title={item?.label ?? ""}
                    amount={`${item?.value ?? "$0"}`}
                    percentage={item?.change ?? ""}
                    currency={item?.currency ?? "."}
                    loading={isLoading}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
