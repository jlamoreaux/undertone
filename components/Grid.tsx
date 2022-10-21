import { SimpleGrid, Container } from "@mantine/core";
import { FC } from "react";

type GridLayoutProps = {
  children?: React.ReactNode;
}

const GridLayout: FC<GridLayoutProps> = ({  children }) => {
  return (
    <Container my="xl">
      <SimpleGrid cols={10} spacing="lg" breakpoints={[
        { maxWidth: "md", cols: 8, spacing: "md" },
        { maxWidth: "sm", cols: 6, spacing: "sm" },
        { maxWidth: "xs", cols: 4, spacing: "sm" },
      ]}>
        {children}
      </SimpleGrid>
    </Container>
  );
};

export default GridLayout;
