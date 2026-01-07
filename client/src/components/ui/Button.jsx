import { cn } from "../../utils/cn";

export const Button = ({ className, variant = "primary", ...props }) => {
  const variants = {
    primary: "bg-black text-white hover:bg-zinc-800 border-black",
    secondary: "bg-white text-black hover:bg-zinc-100 border-black",
    outline: "bg-transparent text-black border-zinc-300 hover:border-black",
  };

  return (
    <button
      className={cn(
        "px-6 py-2.5 border text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
