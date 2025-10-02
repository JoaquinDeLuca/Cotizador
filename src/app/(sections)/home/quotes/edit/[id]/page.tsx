import { EditQuoteDto } from "@/schemas/quote/quote.dto";
import {
  getCompanyClientCatalog,
  getCompanyProductCatalog,
  getCurrenciesCatalog,
} from "../../../_features/actions";

import { getQuoteById } from "../../../_features/quote/actions";
import QuoteForm from "../../_features/components/QuoteForm";
import ErrorState from "@/app/components/ErrorState";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await getQuoteById(Number(id));

  const [resProducts, resClients, resCurrencies] = await Promise.all([
    getCompanyProductCatalog(),
    getCompanyClientCatalog(),
    getCurrenciesCatalog(),
  ]);

  if (!response.success || !resProducts.success || !resClients.success) {
    return (
      <ErrorState
        message={response.message || resProducts.message || resClients.message}
      />
    );
  }

  return (
    <>
      {response.success && (
        <div className="px-5 py-10 flex">
          <QuoteForm
            isEdit
            dataEdit={response.data as unknown as EditQuoteDto}
            optionsProducts={resProducts.data}
            optionsClients={resClients.data}
            optionsCurrencies={resCurrencies ?? []}
          />
        </div>
      )}
    </>
  );
}
