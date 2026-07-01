import { cn } from '@kit/ui/utils';

export function FormSection({
  title,
  description,
  children,
  className,
}: React.PropsWithChildren<{
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}>) {
  return (
    <section className={cn('kinder-form-section', className)}>
      <header className="kinder-form-section__header">
        <h3 className="kinder-form-section__title">{title}</h3>
        {description ? (
          <p className="kinder-form-section__description">{description}</p>
        ) : null}
      </header>
      <div className="kinder-form-section__body">{children}</div>
    </section>
  );
}

export function FormGrid({
  children,
  columns = 2,
  className,
}: React.PropsWithChildren<{
  columns?: 1 | 2 | 3;
  className?: string;
}>) {
  const colClass =
    columns === 1 ? 'grid-cols-1'
    : columns === 3 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
    : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className={cn('grid gap-4', colClass, className)}>{children}</div>
  );
}
