import type { FieldErrors } from "@/lib/account/schema";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";

export function AccountCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-4 rounded-[20px] border border-line p-5 xl:gap-5 xl:px-6 xl:py-5">
      <h2 className="text-xl font-bold text-black xl:text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function FieldError({ name, error }: { name: string; error?: string }) {
  return error ? (
    <p id={`${name}-error`} className="mt-1.5 px-4 text-sm text-discount">
      {error}
    </p>
  ) : null;
}

export function AccountField({
  name,
  errors,
  ...props
}: Omit<React.ComponentProps<typeof TextField>, "name" | "error"> & {
  name: string;
  errors: FieldErrors;
}) {
  return (
    <div className="min-w-0">
      <TextField name={name} error={errors[name]} {...props} />
      <FieldError name={name} error={errors[name]} />
    </div>
  );
}

export function AccountSelect({
  name,
  errors,
  ...props
}: Omit<React.ComponentProps<typeof SelectField>, "name" | "error"> & {
  name: string;
  errors: FieldErrors;
}) {
  return (
    <div className="min-w-0">
      <SelectField name={name} error={errors[name]} {...props} />
      <FieldError name={name} error={errors[name]} />
    </div>
  );
}

export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>;
}
