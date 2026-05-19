'use client';

import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Gift, Hexagon, CircleDollarSign, ScrollText, Key, Sparkles, Shovel, Star, Ticket, Gem, Coins } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { findDiceAndRewards, RollingRewards } from '../_utils/simulate';
import { calculateTokensAndGems, calculateMilestoneRewards, MilestoneRewards } from '../_utils/utils';

const formSchema = z.object({
  goal: z.number().min(20000),
  successRate: z.number().min(50).lt(100),
});

const REWARD_ROWS: { key: keyof MilestoneRewards; label: string; icons: LucideIcon[] }[] = [
  { key: 'drawChests',      label: 'Draw Item Chests',  icons: [Gift] },
  { key: 'treasureCoins',   label: 'Treasure Coins',    icons: [Ticket] },
  { key: 'maskShards',      label: 'Artifact Shards',   icons: [Hexagon] },
  { key: 'chromaKeys',      label: 'Chromatic Keys',    icons: [Key] },
  { key: 'wishTokens',      label: 'Wish Tokens',       icons: [Sparkles] },
  { key: 'runeShovels',     label: 'Rune Shovels',      icons: [Shovel] },
  { key: 'promisedShovels', label: 'Promised Shovels',  icons: [Star, Shovel] },
  { key: 'gold',            label: 'Gold',              icons: [CircleDollarSign] },
  { key: 'scrolls',         label: 'Scroll Fragments',  icons: [ScrollText] },
];

const ROLLING_REWARD_ROWS: { key: keyof RollingRewards; label: string; icons: LucideIcon[] }[] = [
  { key: 'gems',            label: 'Gems',               icons: [Gem] },
  { key: 'chromaKeys',      label: 'Chromatic Keys',     icons: [Key] },
  { key: 'wishCoins',       label: 'Wish Coins',         icons: [Sparkles] },
  { key: 'promiseShovels',  label: 'Promise Shovels',    icons: [Star, Shovel] },
  { key: 'ottaShards',      label: 'Otta Shards',        icons: [Hexagon] },
  { key: 'goldCoins',       label: 'Gold Coins',         icons: [Coins] },
];

type ShouldRollResult = {
  dice: number;
  tokens: number;
  gems: number;
  milestoneRewards: MilestoneRewards;
  rollingRewards: RollingRewards;
};

interface ShouldRollCardProps {
  className?: string;
}
export default function ShouldRollCard({ className }: ShouldRollCardProps) {
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [result, setResult] = useState<ShouldRollResult | undefined>();
  const [showRewards, setShowRewards] = useState(true);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: NaN,
      successRate: 98.69,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { dice: numDice, rollingRewards } = await new Promise<{ dice: number; rollingRewards: RollingRewards }>(
      (resolve) => setTimeout(() => resolve(findDiceAndRewards(values.goal, values.successRate)), 0)
    );
    const { tokens, gems } = calculateTokensAndGems(values.goal);
    const milestoneRewards = calculateMilestoneRewards(values.goal);
    setResult({ dice: numDice, tokens, gems, milestoneRewards, rollingRewards });
  }

  useEffect(() => {
    if (result && resultRef) {
      resultRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [result]);

  return (
    <Fragment>
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center'>
          <span className='text-lg font-bold'>Should I Roll?</span>
          <CardAction>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowRewards((prev) => !prev)}
              disabled={!result}
            >
              {showRewards ? 'Hide Rewards' : 'Show Rewards'}
            </Button>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='goal'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Points</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step={1}
                      placeholder='# of Points'
                      {...field}
                      value={!field.value ? '' : `${field.value}`}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : 0
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    This is the points you are aiming for.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='successRate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chance to reach Goal</FormLabel>
                  <FormControl>
                    <div className='flex items-center gap-2'>
                      <Input
                        type='number'
                        step={0.01}
                        placeholder='Chance of success'
                        {...field}
                        value={!field.value ? '' : `${field.value}`}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : 0
                          )
                        }
                      />
                      <span>%</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {`Enter the desired probability of success (as a percentage) for reaching your goal.`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Calculating...' : 'Calculate'}
            </Button>
          </form>
        </Form>
        {result && (
          <div ref={resultRef} className='mt-2'>
            <span className='text-lg'>You need {result.dice} dice</span>
          </div>
        )}
      </CardContent>
    </Card>
    {showRewards && result && (
      <Card>
        <CardHeader>
          <span className='text-lg font-bold'>Rewards Breakdown</span>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-2 items-center'>
            {result.tokens > 0 && (
              <>
                <span className='col-span-3 font-semibold'>Gem exchange:</span>
                <div className='flex gap-0.5 justify-center'>
                  <Ticket className='h-4 w-4 text-muted-foreground' />
                </div>
                <span className='text-sm'>Treasure coins</span>
                <span className='text-sm font-semibold tabular-nums'>{result.tokens}</span>
                <div className='flex gap-0.5 justify-center'>
                  <Gem className='h-4 w-4 text-muted-foreground' />
                </div>
                <span className='text-sm'>Gems to buy all</span>
                <span className='text-sm font-semibold tabular-nums'>{result.gems.toLocaleString()}</span>
              </>
            )}
            <span className='col-span-3 font-semibold mt-2'>Point milestone rewards:</span>
            {REWARD_ROWS.filter((r) => (result.milestoneRewards[r.key] as number) > 0).map(({ key, label, icons }) => (
              <Fragment key={key}>
                <div className='flex gap-0.5 justify-center'>
                  {icons.map((Icon, i) => (
                    <Icon key={i} className='h-4 w-4 text-muted-foreground' />
                  ))}
                </div>
                <span className='text-sm'>{label}</span>
                <span className='text-sm font-semibold tabular-nums'>
                  {(result.milestoneRewards[key] as number).toLocaleString()}
                </span>
              </Fragment>
            ))}
            <span className='col-span-3 font-semibold mt-2'>Rolling rewards (avg):</span>
            {ROLLING_REWARD_ROWS.filter((r) => (result.rollingRewards[r.key] as number) >= 0.1).map(({ key, label, icons }) => (
              <Fragment key={key}>
                <div className='flex gap-0.5 justify-center'>
                  {icons.map((Icon, i) => (
                    <Icon key={i} className='h-4 w-4 text-muted-foreground' />
                  ))}
                </div>
                <span className='text-sm'>{label}</span>
                <span className='text-sm font-semibold tabular-nums'>
                  {(result.rollingRewards[key] as number).toLocaleString()}
                </span>
              </Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
    </Fragment>
  );
}