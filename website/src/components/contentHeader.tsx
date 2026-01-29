// @ts-nocheck - Type checking disabled during incremental migration. TODO: Add proper props interfaces
import { BreadcrumbGroup, Header } from '@cloudscape-design/components';
import React from 'react';

export function ContentHeader(props) {
  return (
    <>
      <BreadcrumbGroup items={props.breadcrumbs} ariaLabel="Breadcrumbs" />

      <Header variant="h1" description={props.description}>
        {props.header}
      </Header>
    </>
  );
}
