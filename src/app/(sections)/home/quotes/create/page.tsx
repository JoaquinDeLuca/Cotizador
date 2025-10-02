import {
  getCompanyClientCatalog,
  getCompanyProductCatalog,
  getCurrenciesCatalog,
} from "../../_features/actions";
import QuoteForm from "../_features/components/QuoteForm";

import ErrorState from "@/app/components/ErrorState";

export default async function Page() {
  // GET Catalogs
  const [resProducts, resClients] = await Promise.all([
    getCompanyProductCatalog(),
    getCompanyClientCatalog(),
  ]);

  if (!resProducts.success || !resClients.success) {
    return <ErrorState message={resProducts.message || resClients.message} />;
  }

  const currencies = await getCurrenciesCatalog();

  return (
    <>
      <div className="px-5 py-10 flex">
        <QuoteForm
          optionsProducts={resProducts.data}
          optionsClients={resClients.data}
          optionsCurrencies={currencies ?? []}
          isEdit={false}
        />
      </div>
    </>
  );
}
