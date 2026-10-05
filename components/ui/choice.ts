export function swatchClasses(selected: boolean) {
  return `flex items-center justify-center rounded-full border border-black/20 transition-[transform,box-shadow] duration-200 ease-out-expo hover:scale-110 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100 ${
    selected ? "ring-2 ring-black ring-offset-2" : ""
  }`;
}

export function chipClasses(selected: boolean) {
  return `inline-flex items-center justify-center rounded-[62px] transition-[background-color,color,transform] duration-200 active:scale-95 motion-reduce:active:scale-100 ${
    selected
      ? "bg-black font-medium text-white"
      : "bg-muted text-text-60 hover:bg-black/10 hover:text-black"
  }`;
}

export const STEPPER_BUTTON =
  "-mx-2 inline-flex size-8 items-center justify-center rounded-full text-xl leading-none transition-[background-color,transform] duration-150 hover:bg-black/[0.08] active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent motion-reduce:active:scale-100";
