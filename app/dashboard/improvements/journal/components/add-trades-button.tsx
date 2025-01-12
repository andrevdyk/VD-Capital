import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AddTradesButton() {
  return (
    <div className="z-10 flex items-center justify-center">
      <Link href="/dashboard/improvements/journal/add-trades">
        <Button variant="outline" className="shadow-2xl py-1 ">Add Trades</Button>
      </Link>
    </div>
  );
}