import { MatchExtended, OverlayStateProps } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { BallEvent } from "@prisma/client";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";
import { calcRuns, getIsvalidBall } from "@/lib/utils";

type Batsman = {
  id: string;
  name?: string;
  runs: number;
  balls: number;
};

type Partnership = {
  batsman1: Batsman;
  batsman2: Batsman | null;
  total: number;
  balls: number;
};

function getPartnerships(
  events: Pick<BallEvent, "batsmanId" | "bowlerId" | "type">[],
  teams: MatchExtended["teams"],
): Partnership[] {
  const partnerships: Partnership[] = [];
  let currentPartnership: Partnership | null = null;

  const getPlayerName = (id?: string) => {
    if (!id) return "";
    return (
      teams.flatMap((team) => team.players).find((player) => player.id === id)
        ?.name || ""
    );
  };

  events.forEach((event, index) => {
    const isValidBall = getIsvalidBall(event.type) && event.type !== "-4";

    if (!currentPartnership) {
      currentPartnership = {
        batsman1: { id: event.batsmanId, runs: 0, balls: 0 },
        batsman2: null,
        total: 0,
        balls: 0,
      };
    }

    if (event.type.includes("-1")) {
      if (isValidBall) currentPartnership.balls++;
      if (currentPartnership.batsman1.id === event.batsmanId) {
        currentPartnership.batsman1.balls += 1;
      } else {
        if (!currentPartnership.batsman2) {
          currentPartnership.batsman2 = {
            id: event.batsmanId,
            runs: 0,
            balls: 1,
          };
        }
      }
      if (currentPartnership.batsman2) partnerships.push(currentPartnership);

      currentPartnership = {
        batsman1: { id: event.batsmanId, runs: 0, balls: 0 },
        batsman2: null,
        total: 0,
        balls: 0,
      };
    } else {
      const runs = calcRuns([event.type]);

      if (isValidBall || event.type.includes("-3")) {
        if (isValidBall) currentPartnership.balls++;
        if (currentPartnership.batsman1.id === event.batsmanId)
          currentPartnership.batsman1.balls += 1;
        else {
          if (!currentPartnership.batsman2)
            currentPartnership.batsman2 = {
              id: event.batsmanId,
              runs: 0,
              balls: 1,
            };
          else currentPartnership.batsman2.balls++;
        }
      }
      currentPartnership.total += runs;

      const runsBatsman = calcRuns([event.type], true);
      if (currentPartnership.batsman1.id === event.batsmanId) {
        currentPartnership.batsman1.runs += runsBatsman;
      } else {
        if (!currentPartnership.batsman2) {
          currentPartnership.batsman2 = {
            id: event.batsmanId,
            runs: runsBatsman,
            balls: 1,
          };
        } else {
          currentPartnership.batsman2.runs += runsBatsman;
        }
      }
    }

    if (index === events.length - 1 && currentPartnership?.batsman2) {
      partnerships.push(currentPartnership);
    }
  });

  const partnershipsWithNames = partnerships.map((partnership) => ({
    ...partnership,
    batsman1: {
      ...partnership.batsman1,
      name: getPlayerName(partnership.batsman1.id),
    },
    batsman2: partnership.batsman2
      ? {
          ...partnership.batsman2,
          name: getPlayerName(partnership.batsman2.id),
        }
      : null,
  }));

  return partnershipsWithNames;
}

function Partnerships({
  open,
  setOpen,
  teams,
  events,
}: OverlayStateProps & {
  teams: MatchExtended["teams"];
  events: [
    BallEvent[] | CreateBallEventSchema[],
    BallEvent[] | CreateBallEventSchema[],
  ];
}) {
  const [fTeamEvents, sTeamEvents] = events;

  const fTeampartnerships = getPartnerships(fTeamEvents, teams);
  const sTeampartnerships = getPartnerships(sTeamEvents, teams);

  console.log(fTeampartnerships);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partnerships</DialogTitle>
        </DialogHeader>
        {fTeampartnerships.map((partnership, index) => (
          <PartnershipBar partnership={partnership} key={index} />
        ))}
      </DialogContent>
    </Dialog>
  );
}

const PartnershipBar: React.FC<{ partnership: Partnership }> = ({
  partnership,
}) => {
  const { batsman1, batsman2, balls, total } = partnership;

  const totalWidth = batsman1.runs + (batsman2?.runs ?? 0);
  const width1 = (batsman1.runs / totalWidth) * 100;
  const width2 = ((batsman2?.runs ?? 0) / totalWidth) * 100;

  return (
    <div>
      <div className="mb-1 flex justify-between">
        <div className="flex items-center gap-1">
          <h6>{batsman1.name}</h6>
          <p className="text-sm text-muted-foreground">
            {batsman1.runs} ({batsman1.balls})
          </p>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-sm">
          {total} ({balls})
        </div>
        {batsman2 && (
          <div className="flex items-center gap-1">
            <p className="text-sm text-muted-foreground">
              {batsman2.runs} ({batsman2.balls})
            </p>
            <h6>{batsman2.name}</h6>
          </div>
        )}
      </div>
      <div className="flex">
        <div
          style={{ width: `${width1}%` }}
          className="flex w-full items-center rounded-l-md bg-teal-500 px-2 py-1 text-sm text-emerald-950"
        >
          {batsman1.runs}
        </div>
        {batsman2 && (
          <div
            style={{ width: `${width2}%` }}
            className="flex w-full items-center justify-end rounded-r-md bg-orange-400 px-2 py-1 text-sm text-orange-950"
          >
            {batsman2.runs}
          </div>
        )}
      </div>
    </div>
  );
};

export default Partnerships;
