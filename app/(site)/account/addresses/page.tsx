import { listAddresses, requireAccountUser } from "@/lib/account/queries";
import { AddressBook } from "@/components/account/AddressBook";

export default async function AccountAddressesPage() {
  const user = await requireAccountUser("/account/addresses");
  const addresses = await listAddresses(user.id);
  return <AddressBook addresses={addresses} />;
}
