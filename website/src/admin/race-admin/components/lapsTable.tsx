import { useCollection } from '@cloudscape-design/collection-hooks';
import { Button, Table, TableProps } from '@cloudscape-design/components';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../components/tableConfig';
import { ColumnConfiguration, LapTableItem } from '../support-functions/lapsTableConfig';
import { Race, Lap } from '../../../types/domain';

/**
 * Props interface for LapsTable component
 */
interface LapsTableProps {
  /** Race object containing lap data */
  race: Race | null;
  /** Average lap information (currently unused) */
  averageLapInformation?: any;
  /** Table settings like loading state */
  tableSettings?: Partial<TableProps>;
  /** Callback when lap selection changes */
  onSelectionChange: (laps: Lap[]) => void;
  /** Currently selected laps */
  selectedLaps: Lap[];
  /** Whether table is in edit mode */
  isEditable: boolean;
}

/**
 * LapsTable component that displays lap data for a race
 * @param props - Component props
 * @returns Rendered laps table
 */
const LapsTable = ({
  race,
  averageLapInformation,
  tableSettings,
  onSelectionChange,
  selectedLaps,
  isEditable,
}: LapsTableProps): JSX.Element => {
  const { t } = useTranslation();
  const [laps, setLaps] = useState<LapTableItem[]>([]);

  useEffect(() => {
    if (!race || !race.laps) return;

    const items: LapTableItem[] = race.laps.map((lap) => {
      const averageLapInformation = (race as any).averageLaps; // Runtime property not in type definition

      let averageLap;
      if (averageLapInformation) {
        averageLap = averageLapInformation.find((avg: any) => '' + avg.endLapId === lap.lapId);
      }

      return {
        ...lap,
        time: lap.lapTime, // Map lapTime to time for table display
        avgTime: averageLap ? averageLap.avgTime : undefined,
        resets: lap.resetCount,
      };
    });

    setLaps(items);
  }, [race]);

  // Table config
  const columnConfiguration = ColumnConfiguration(isEditable);

  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } =
    useCollection(laps, {
      filtering: {
        empty: <EmptyState title={t('race-admin.no-races')} subtitle="" action={null} />,
        noMatch: (
          <EmptyState
            title={t('common.no-matches')}
            subtitle={t('common.we-cant-find-a-match')}
            action={<Button onClick={() => actions.setFiltering('')}>{t('table.clear-filter')}</Button>}
          />
        ),
      },
      pagination: { pageSize: 20 },
      sorting: { defaultState: { sortingColumn: columnConfiguration.columnDefinitions[0] } },
      selection: {},
    });

  // JSX
  return (
    <Table
      {...collectionProps}
      {...tableSettings}
      stickyHeader={true}
      stripedRows={true}
      onSelectionChange={({ detail }) => {
        onSelectionChange(detail.selectedItems as Lap[]);
      }}
      selectedItems={selectedLaps}
      columnDefinitions={columnConfiguration.columnDefinitions}
      items={items}
      trackBy="lapId"
    />
  );
};

export { LapsTable };
