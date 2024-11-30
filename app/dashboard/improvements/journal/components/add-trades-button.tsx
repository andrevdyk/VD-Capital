import Link from 'next/link';
import ShimmerButton from "@/components/magicui/shimmer-button";

export function AddTradesButton() {
  return (
    <div className="z-10 flex min-h-24 items-center justify-center">
      <Link href="/dashboard/improvements/journal/add-trades">
        <ShimmerButton className="shadow-2xl py-1 ">
          <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
            Add Trades
          </span>
        </ShimmerButton>
      </Link>
    </div>
  );
}