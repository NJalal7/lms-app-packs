import { useFieldContext } from '@/components/forms/form-context'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'

export function CheckboxField({ label }: { label: string }) {
  const field = useFieldContext<boolean>()
  const errors = field.state.meta.errors

  return (
    <Field orientation="horizontal" data-invalid={errors.length > 0}>
      <Checkbox
        id={field.name}
        name={field.name}
        checked={!!field.state.value}
        aria-invalid={errors.length > 0}
        onBlur={field.handleBlur}
        onCheckedChange={(checked) => field.handleChange(checked === true)}
      />
      <FieldLabel htmlFor={field.name} className="font-normal">
        {label}
      </FieldLabel>
      <FieldError errors={errors.map((e) => ({ message: typeof e === 'string' ? e : String(e) }))} />
    </Field>
  )
}
