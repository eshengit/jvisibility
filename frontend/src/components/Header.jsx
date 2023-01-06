import React from "react";
import { Heading, Flex, Divider } from "@chakra-ui/react";

const Header = () => {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="nowrap"
      padding="0.5rem"
      bg="gray.400" 
      height="100px"
    >
      <Flex align="center" mr={15}>
        <Heading as="h1" size="md">JVM Profiling</Heading>
        
      </Flex>
    </Flex>
  );
};

export default Header;
