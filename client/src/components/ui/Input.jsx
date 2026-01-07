import { cn } from "../../utils/cn";

export const Input = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="nothing-dot-font text-[10px] text-zinc-500">{label}</label>}
      <input
        className={cn(
          "px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-black focus:outline-none transition-all text-sm",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <span className="nothing-dot-font text-[9px] text-red-500 uppercase">{error}</span>}
    </div>
  );
};
