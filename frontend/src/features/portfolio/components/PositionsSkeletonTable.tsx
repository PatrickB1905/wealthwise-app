import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { PositionsTableContainer, SkeletonBlock, StickyTableHead } from '@shared/ui';

export function PositionsSkeletonTable() {
  return (
    <PositionsTableContainer component={Paper}>
      <Table size="small">
        <StickyTableHead>
          <TableRow>
            <TableCell>Ticker</TableCell>
            <TableCell align="right">Buy Price</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Current Price</TableCell>
            <TableCell align="right">Amount Invested</TableCell>
            <TableCell align="right">Total P/L (%)</TableCell>
            <TableCell align="right">Total P/L</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </StickyTableHead>

        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <SkeletonBlock variant="text" width={140} />
              </TableCell>
              <TableCell align="right">
                <SkeletonBlock variant="text" width={90} />
              </TableCell>
              <TableCell align="right">
                <SkeletonBlock variant="text" width={70} />
              </TableCell>
              <TableCell align="right">
                <SkeletonBlock variant="text" width={100} />
              </TableCell>
              <TableCell align="right">
                <SkeletonBlock variant="text" width={130} />
              </TableCell>
              <TableCell align="right">
                <SkeletonBlock variant="text" width={90} />
              </TableCell>
              <TableCell align="right">
                <SkeletonBlock variant="text" width={110} />
              </TableCell>
              <TableCell align="center">
                <SkeletonBlock variant="rounded" width={140} height={28} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PositionsTableContainer>
  );
}
