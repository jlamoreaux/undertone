import { SimpleGrid, Container } from "@mantine/core";
import { FC } from "react";

type GridLayoutProps = {
  children: React.ReactNode[];
};

const GridLayout: FC<GridLayoutProps> = ({ children }) => {
  return (
    <Container
      my={{ base: "sm", sm: "md", lg: "lg" }}
      size="xl"
      px={{ base: "sm", sm: "md", lg: "lg" }}
    >
      <SimpleGrid
        cols={{ base: 3, xs: 4, sm: 5, md: 6, lg: 7, xl: 8 }}
        spacing={{ base: "xs", xs: "sm", sm: "sm", md: "md", lg: "md" }}
        verticalSpacing={{ base: "xs", xs: "sm", sm: "sm", md: "md", lg: "md" }}
      >
        {children}
      </SimpleGrid>
    </Container>
  );
};

export default GridLayout;
