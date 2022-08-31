import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { Header, Table, Icon, Button, Input } from 'semantic-ui-react';
import { useTable, useSortBy, useRowSelect, useFilters } from 'react-table'
import { Auth } from 'aws-amplify';

function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length

  return (
    <Input
      icon={{ name: 'search', circular: true }}
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} users...`}
    />
  )
}

function AdminUsers() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const apiName = 'deepracerEventManager';

  useEffect(() => {
    const getUsers = async() => {
      const apiUserPath = 'users';

      const userRsponse = await API.get(apiName, apiUserPath);
      const users = userRsponse.map(u =>
        ({
          ...u,
          isAdmin: false,
          currentUser: false,
        })
      )

      const apiAdminPath = 'admin/groups/admin';

      const adminResponse = await API.get(apiName, apiAdminPath);
      adminResponse.forEach(admin => {
        const i = users.findIndex((user => user.Username === admin.Username));
        users[i].isAdmin = true;
      });

      // Need to get the current user and flag them in the data
      // (Current user can't remove themselves from a group they are members of)
      Auth.currentAuthenticatedUser().then(loggedInUser => {
        const i = users.findIndex((user => user.Username === loggedInUser.username));
        users[i].currentUser = true;
      });

      setData(users);
      setIsLoading(false);
    }

    getUsers();

    return() => {
      // Unmounting
    }

  },[refreshKey]);

  const ToggleUserGroup = async(user) => {
    const apiName = 'deepracerEventManager';

    if (user.isAdmin) {
      const apiGroupUserPath = 'admin/groups/admin/' + user.Username;
      await API.del(apiName, apiGroupUserPath)
    } else {
      const apiGroupUserPath = 'admin/groups/admin';
      const params = {
        body: {
          username: user.Username
        },
      };
      await API.post(apiName, apiGroupUserPath, params)
    }
    // need to reload the user data
    setRefreshKey(oldKey => oldKey +1)
  }

  const columns = React.useMemo(
    () => [
      {
        Header: 'User',
        accessor: (row) => {
          if (row.currentUser) {
            return row.Username + ' (You)'
          } else {
            return row.Username
          }
        }
      },
      {
        Header: 'Admin',
        disableFilters: true,
        accessor: (row) => {
          if (row.currentUser) {
            return (
              <Button circular color='blue' size='large' icon='dont' id='{row.Username}' disabled='true' />
            )
          } else {
            if (row.isAdmin) {
              return (
                <Button circular color='green' size='large' icon='check' id='{row.Username}' onClick={(c) => { ToggleUserGroup(row) }} />
              )
            } else {
              return (
                <Button circular color='red' size='large' icon='delete' id='{row.Username}' onClick={(c) => { ToggleUserGroup(row) }} />
              )
            }
          }
        }
      }
    ],
    []
  )

  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useFilters,
    useSortBy,
    useRowSelect
  )

  return (
    <>
      <Header as='h1' icon textAlign='center'>Users</Header>
      {isLoading ? (
        <div>Loading data...</div>
      ) : (
      <Table celled striped {...getTableProps()}>
        <Table.Header>
          {headerGroups.map(headerGroup => (
            <Table.Row {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <Table.HeaderCell {...column.getHeaderProps(column.getSortByToggleProps())}>
                  <div>
                    {column.render('Header')}
                    {column.canSort
                      ? column.isSorted
                        ? column.isSortedDesc
                          ? <Icon name='sort down' />
                          : <Icon name='sort up' />
                        : <Icon disabled name='sort' />
                      : ''}
                    {column.canFilter ? column.render('Filter') : null}
                  </div>
                </Table.HeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row)
            return (
              <Table.Row {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <Table.Cell {...cell.getCellProps()}>{cell.render('Cell')}</Table.Cell>
                })}
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
      )}
    </>
  )
}

export {AdminUsers}
