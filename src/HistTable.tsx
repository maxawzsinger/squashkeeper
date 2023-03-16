import { useState } from 'react';
import { createStyles, Table, ScrollArea, rem } from '@mantine/core';
import { matchHistRow, playersRow, timestampToLocale } from './helpers';

const useStyles = createStyles((theme) => ({
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    transition: 'box-shadow 150ms ease',

    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `${rem(1)} solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[2]
      }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));


interface TableScrollAreaProps {
    data : matchHistRow[] ;
}

export function MatchHistTable({ data }: TableScrollAreaProps) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);

  
  const rows = data.map((row) => (
    <tr key={`${row.playerOneName}-${row.playerTwoName}`}>
      <td>{row.playerOneDidWin ? row.playerOneName : row.playerTwoName}</td>
      <td>{row.playerOneDidWin ? row.playerTwoName : row.playerOneName}</td>
      <td>{timestampToLocale(row.unixTS)}</td>
    </tr>
  ));

  return (
    <ScrollArea h={300} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700}>
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <th>Won</th>
            <th>Lost</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}