"use client";
import {
  Children,
  isValidElement,
  useState,
  useRef,
  type SelectHTMLAttributes,
  type ReactElement,
} from "react";
import {
  Select as Root,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export default function Select({
  children,
  name,
  defaultValue,
  value,
  onChange,
  className,
  required,
  disabled,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const empty = "__dashboard_empty__";
  const options = Children.toArray(children).filter(
    isValidElement,
  ) as ReactElement<{
    value?: string;
    children?: React.ReactNode;
    disabled?: boolean;
  }>[];
  const [current, setCurrent] = useState(
    String(
      defaultValue ??
        options[0]?.props.value ??
        options[0]?.props.children ??
        "",
    ),
  );
  const actual = value === undefined ? current : String(value);
  return (
    <Root
      onOpenChange={(open) => {
        if (open) setContainer(trigger.current?.closest("dialog") ?? null);
      }}
      value={actual || empty}
      required={required}
      disabled={disabled}
      onValueChange={(v) => {
        const next = v === empty ? "" : v;
        setCurrent(next);
        onChange?.({
          target: { value: next },
          currentTarget: { value: next },
        } as React.ChangeEvent<HTMLSelectElement>);
      }}
    >
      <SelectTrigger
        ref={trigger}
        aria-label={props["aria-label"]}
        id={props.id}
        className={className}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent portalContainer={container} className="dashboard-font">
        {options.map((option, i) => {
          const v = String(option.props.value ?? option.props.children ?? "");
          return (
            <SelectItem
              key={v || i}
              value={v || empty}
              disabled={option.props.disabled}
            >
              {option.props.children}
            </SelectItem>
          );
        })}
      </SelectContent>
      <select
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        name={name}
        value={actual}
        disabled={disabled}
        required={required}
        onChange={() => {}}
        onInvalid={(e) => {
          e.preventDefault();
          const container = e.currentTarget.parentElement;
          container
            ?.querySelector<HTMLButtonElement>('[role="combobox"]')
            ?.focus();
        }}
      >
        {children}
      </select>
    </Root>
  );
}
