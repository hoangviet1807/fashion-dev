"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";

export type DropdownOption<T extends string> = { value: T; label: string };

type Trigger = "inline" | "pill" | "icon";

const triggers: Record<Trigger, string> = {
  inline:
    "-my-1 gap-1 rounded-full py-1 pr-2 pl-2.5 font-medium text-black hover:bg-muted data-[open=true]:bg-muted",
  pill:
    "h-12 gap-2 rounded-[62px] border border-line bg-white px-5 text-sm font-medium text-black hover:border-black data-[open=true]:border-black xl:px-6 xl:text-base",
  icon:
    "size-10 justify-center rounded-full bg-muted hover:bg-black/10 data-[open=true]:bg-black/10 xl:size-12",
};

export function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  trigger = "pill",
  icon,
  align = "start",
  className = "",
}: {
  /** Accessible name; also shown as the menu heading for the icon trigger. */
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  trigger?: Trigger;
  icon?: string;
  align?: "start" | "end";
  className?: string;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", timer: 0 });
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [active, setActive] = useState(selectedIndex);
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus({ preventScroll: true });
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function show(index = selectedIndex) {
    setActive(index);
    setOpen(true);
  }

  function close(refocus = true) {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }

  function choose(index: number) {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    close();
  }

  function onButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      show(event.key === "ArrowUp" ? options.length - 1 : selectedIndex);
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const last = options.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((index) => (index >= last ? 0 : index + 1));
        return;
      case "ArrowUp":
        event.preventDefault();
        setActive((index) => (index <= 0 ? last : index - 1));
        return;
      case "Home":
        event.preventDefault();
        setActive(0);
        return;
      case "End":
        event.preventDefault();
        setActive(last);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(active);
        return;
      case "Escape":
        event.preventDefault();
        close();
        return;
      case "Tab":
        close(false);
        return;
    }

    if (event.key.length === 1 && /\S/.test(event.key)) {
      const state = typeahead.current;
      window.clearTimeout(state.timer);
      state.text += event.key.toLocaleLowerCase("vi");
      state.timer = window.setTimeout(() => (state.text = ""), 500);
      const match = options.findIndex((option) =>
        option.label.toLocaleLowerCase("vi").startsWith(state.text),
      );
      if (match >= 0) setActive(match);
    }
  }

  let content: ReactNode;
  if (trigger === "icon" && icon) {
    content = <Icon src={icon} size={20} />;
  } else {
    content = (
      <>
        <span className="truncate">{selected?.label}</span>
        <Icon
          src="/icons/chevron.svg"
          size={16}
          className={`transition-transform duration-300 ease-out-expo motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </>
    );
  }

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={trigger === "icon" ? label : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        data-open={open}
        onClick={() => (open ? close() : show())}
        onKeyDown={onButtonKeyDown}
        className={`inline-flex shrink-0 cursor-pointer items-center whitespace-nowrap transition-[background-color,border-color,transform] duration-200 active:scale-[0.97] motion-reduce:active:scale-100 ${triggers[trigger]}`}
      >
        {trigger !== "icon" ? <span className="sr-only">{label}: </span> : null}
        {content}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${id}-opt-${active}`}
            onKeyDown={onListKeyDown}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className={`absolute top-full z-50 mt-2 max-h-72 min-w-full w-max overflow-y-auto overscroll-contain rounded-2xl border border-line bg-white p-1.5 text-sm text-black shadow-[0_18px_40px_-18px_rgb(0_0_0/0.28)] outline-none xl:text-base ${
              align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left"
            }`}
          >
            {trigger === "icon" ? (
              <li
                role="presentation"
                className="px-3 pt-1.5 pb-1 text-xs font-medium text-text-60"
              >
                {label}
              </li>
            ) : null}
            {options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  id={`${id}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  data-index={index}
                  data-active={index === active}
                  onPointerMove={() => setActive(index)}
                  onClick={() => choose(index)}
                  className={`flex cursor-pointer select-none items-center justify-between gap-6 rounded-xl px-3 py-2.5 transition-colors duration-150 data-[active=true]:bg-muted ${
                    isSelected ? "font-medium" : "text-text-60 data-[active=true]:text-black"
                  }`}
                >
                  {option.label}
                  <Icon
                    src="/icons/check.svg"
                    size={12}
                    className={`brightness-0 ${isSelected ? "" : "invisible"}`}
                  />
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
