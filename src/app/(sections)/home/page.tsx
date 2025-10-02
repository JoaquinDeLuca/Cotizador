import SectionTop from "./_features/SectionTop";
import SectionTabs from "./_features/SectionTabs";
import { TabName } from "@/app/constants/optionsSelects";
import { getProductsList } from "./_features/product/actions";
import { getQuotesList } from "./_features/quote/actions";
import { getClientsList } from "./_features/client/actions";
import type { ResProductList } from "./_features/product/product-types";
import type { ResQuoteList } from "./_features/quote/quote-types";
import type { ResClientList } from "./_features/client/client-types";
import { QuotationStatus } from "@prisma/client";
import { getCurrenciesCatalog } from "./_features/actions";

export default async function homePage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    tab: string;
    status?: string;
  }>;
}) {
  // Extramos los datos de los searchParams
  const params = await searchParams;
  const search = params.search || "";
  const page = Number(params.page || 1);
  const pageSize = 10;
  const tab = params.tab || TabName.quote;

  const initialState = {
    data: [],
    success: null as boolean | null,
    total: 0,
    message: "",
  };
  // Definimos el formato inicial
  let products: ResProductList = initialState;

  let clients: ResClientList = initialState;

  let quotes: ResQuoteList = initialState;

  // Según el tabs hacemos la búsqueda
  if (tab === TabName.product) {
    products = await getProductsList(search, page, pageSize);
  }

  if (tab === TabName.client) {
    clients = await getClientsList(search, page, pageSize);
  }

  if (tab === TabName.quote) {
    quotes = await getQuotesList(
      search,
      page,
      pageSize,
      params.status as QuotationStatus
    );
  }

  const optionsCurrencies = await getCurrenciesCatalog();

  return (
    <div>
      <SectionTop optionsCurrencies={optionsCurrencies ?? []} />

      <SectionTabs
        products={products}
        clients={clients}
        quotes={quotes}
        searchParams={params}
      />
    </div>
  );
}
