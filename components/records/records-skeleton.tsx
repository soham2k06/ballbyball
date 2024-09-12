import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

function RecordsSkeleton() {
  return (
    <Card className="mt-2 overflow-x-auto">
      <CardHeader>
        <CardTitle>Most runs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary/90">
              {Array(12)
                .fill(0)
                .map((_, index) => (
                  <TableHead className="text-primary-foreground" key={index}>
                    <Skeleton className="h-5 w-20 rounded-sm bg-primary-foreground" />
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(10)
              .fill(0)
              .map((_, index) => (
                <TableRow key={index}>
                  {Array(12)
                    .fill(0)
                    .map((_, index) => (
                      <TableCell
                        className="text-primary-foreground"
                        key={index}
                      >
                        <Skeleton className="h-5 w-20 rounded-sm bg-muted" />
                      </TableCell>
                    ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default RecordsSkeleton;
