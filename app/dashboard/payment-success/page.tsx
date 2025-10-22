'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [nextPaymentDate, setNextPaymentDate] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserName(user.email?.split('@')[0] || 'Trader');

        // fetch latest active subscription
        const { data: subs } = await (supabase as any)
          .from('subscriptions')
          .select('current_period_end')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('current_period_end', { ascending: false })
          .limit(1)
          .single();

        if (subs?.current_period_end) {
          const nextDate = format(new Date(subs.current_period_end), 'PPP');
          setNextPaymentDate(nextDate);
        }
      }
    };

    fetchSubscription();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white px-6">
      <Card className="max-w-md w-full text-center border border-zinc-700 shadow-xl bg-zinc-950/70 backdrop-blur-md">
        <CardHeader>
          <div className="flex justify-center mb-3">
            <CheckCircle2 className="h-12 w-12 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to VD Capital</CardTitle>
        </CardHeader>

        <CardContent className="text-sm space-y-4">
          <p className="text-zinc-300">
            Congratulations, <span className="font-semibold">{userName}</span>! 🎉
          </p>
          <p className="text-zinc-400">
            Your subscription is now active. We’re excited to have you join the VD Capital
            trading community.
          </p>

          {nextPaymentDate ? (
            <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700">
              <p className="text-zinc-400 text-xs mb-1">Next Payment Date</p>
              <p className="font-semibold text-base text-green-400">{nextPaymentDate}</p>
            </div>
          ) : (
            <p className="text-zinc-500">Fetching your subscription details...</p>
          )}

          <p className="text-zinc-400">
            We wish you the best of luck in your trading journey! 📈
          </p>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            className="bg-green-500 hover:bg-green-600 text-black font-semibold"
            onClick={() => router.push('/dashboard')}
          >
            Continue to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
