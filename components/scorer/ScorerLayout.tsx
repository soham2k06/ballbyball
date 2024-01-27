'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

import { useState } from 'react'

import BallSummary from './BallSummary'
import { EventType } from '@/types'

import ScoreWrapper from './ScoreWrapper'
import DangerActions from './DangerActions'
import ScoreButtons from './ScoreButtons'
import OverStats from './OverStats'
import FooterSummary from './FooterSummary'

export const ballEvents: Record<string, string> = {
  '-3': 'NB',
  '-2': 'WD',
  '-1': 'W',
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
}

function ScorerLayout() {
  const [balls, setBalls] = useState<EventType[]>([])
  const invalidBalls = ['-3', '-2']
  const totalBalls = balls.filter(
    (d, index) => !invalidBalls.includes(d) && (index === 0 || balls[index - 1] !== '-3')
  ).length

  console.log('👀totalBalls', totalBalls)

  let ballLimitInOver = 6
  function generateOverSummary(ballEvents: EventType[]) {
    const overSummaries = []
    let validBallCount = 0
    let currentOver = []
    for (const ballEvent of ballEvents) {
      currentOver.push(ballEvent)

      if (!invalidBalls.includes(ballEvent)) {
        validBallCount++
        if (validBallCount === 6) {
          overSummaries.push(currentOver)
          currentOver = []
          validBallCount = 0
          ballLimitInOver = 6
        }
      } else ballLimitInOver++
    }

    if (validBallCount >= 0 && currentOver.length > 0) {
      overSummaries.push(currentOver)
    }

    return overSummaries
  }

  const overSummaries: EventType[][] = generateOverSummary(balls) as EventType[][]

  // stats - small
  const curOverIndex = Math.floor(totalBalls / 6)

  function handleScore(e: React.MouseEvent<HTMLButtonElement>) {
    const event = e.currentTarget.value
    setBalls((prev) => [...prev, event as EventType])
  }

  function handleUndo() {
    setBalls((prev) => prev.slice(0, -1))
  }

  return (
    <>
      <DangerActions handleRestart={() => setBalls([])} handleUndo={handleUndo} />
      <Card className='max-sm:w-full sm:w-96 border-0'>
        <CardContent className='p-0'>
          <ScoreWrapper balls={balls} curOverIndex={curOverIndex} totalBalls={totalBalls} />
          <BallSummary summary={overSummaries[curOverIndex]} ballLimitInOver={ballLimitInOver} />
        </CardContent>

        {/* <Separator className="sm:my-4 my-2" /> */}
        <ScoreButtons handleScore={handleScore} ballEvents={ballEvents} />
        <Separator className='sm:my-4 my-2' />
        <CardFooter className='block px-0'>
          <div className='gap-2 flex pb-6'>
            <OverStats overSummaries={overSummaries} />
            <Button className='w-full' onClick={handleUndo}>
              Summary
            </Button>
          </div>

          <FooterSummary balls={balls} curOverSummary={overSummaries[curOverIndex]} />
        </CardFooter>
      </Card>
    </>
  )
}

export default ScorerLayout
