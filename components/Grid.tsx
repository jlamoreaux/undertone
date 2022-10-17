import { SimpleGrid, Container } from '@mantine/core';
import { FC, ReactNode } from 'react';

type GridLayoutProps = {
  children?: React.ReactNode;
}

const GridLayout: FC<GridLayoutProps> = ({  children }) => {
  return (
    <Container my="md">
      <SimpleGrid cols={10} spacing="md" breakpoints={[
        { maxWidth: "md", cols: 8, spacing: 'md' },
        { maxWidth: "sm", cols: 6, spacing: 'sm' },
        { maxWidth: "xs", cols: 4, spacing: 'sm' },
      ]}>
        {children}
      </SimpleGrid>
    </Container>
  );
};

export default GridLayout;
