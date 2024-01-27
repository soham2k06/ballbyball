import { EventType } from '@/types'
import { Separator } from '../ui/separator'
import { calcRuns, calcWickets } from '@/lib/utils'

function ScoreWrapper({
  balls,
  totalBalls,
  curOverIndex,
}: {
  balls: EventType[]
  totalBalls: number
  curOverIndex: number
}) {
  const runs = calcRuns(balls)
  const wickets = calcWickets(balls)
  return (
    <div className='pb-4'>
      <h2 className='block text-center font-semibold text-7xl tabular-nums mb-5'>
        {runs}/{wickets}
      </h2>
      <div className='opacity-50 flex justify-center text-center'>
        <span>
          ({curOverIndex}
          {totalBalls % 6 ? `.${totalBalls % 6}` : ''})
        </span>
        <Separator orientation='vertical' className='bg-muted-foreground h-6 mx-2' />
        <span>RR: {runs ? ((runs / totalBalls) * 6).toFixed(2) : 0}</span>
      </div>
    </div>
  )
}

export default ScoreWrapper
