import { quoteStatusOptions } from "@/app/constants/optionsSelects";
import { Tag } from "antd";
import { getColorStatus } from "./functions";

interface Props {
  options: { label: string; value: number }[];
}

export function formatPrintProductsOptions({ options }: Props) {
  const printOptionsProducts = options.map((product) => {
    const [name, sku, price] = (product.label as string).split(" - ");

    return {
      value: product.value, // Solo el ID como value
      label: (
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-gray-500">{sku}</div>
          </div>
          <div className="text-sm font-medium pr-2">${price}</div>
        </div>
      ),
      searchValue: `${name} ${sku}`, // campo se usa solo para la búsqueda
      price: price,
      name: name,
      sku: sku,
    };
  });

  return printOptionsProducts;
}

export function formatPrintClientOptions({ options }: Props) {
  const printOptionsClients = options.map((client) => {
    const [name, cuit] = (client.label as string).split(" - ");

    return {
      value: client.value, // Solo el ID como value
      label: (
        <div className="flex items-center gap-2">
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-gray-500">CUIT: {cuit}</p>
        </div>
      ),
      searchValue: `${name} ${cuit}`, // campo se usa solo para la búsqueda
    };
  });

  return printOptionsClients;
}

export function formatPrintStatusOptions() {
  const printOptionsClients = quoteStatusOptions.map((status) => {
    return {
      value: status.value, // Solo el ID como value
      label: (
        <Tag
          color={getColorStatus(status.value)}
          style={{ borderRadius: ".3rem" }}
          className="font-semibold"
        >
          {status.label}
        </Tag>
      ),
    };
  });

  return printOptionsClients;
}
