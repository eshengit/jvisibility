import React from "react";
import { render } from 'react-dom';
import { ChakraProvider, Tabs, TabList, TabPanels, Tab, TabPanel, EditableTextarea, Button, Box } from "@chakra-ui/react";
import Header from "./components/Header";
import Control  from "./components/Control";

function App() {
  return (
    <ChakraProvider>
      <Header/>
      <Tabs variant="line">
      <TabList>
        <Tab id='1'>Manage</Tab>
        <Tab id='2'>Suspect Deadlock</Tab>
        <Tab id='3'>Suspect Slowness</Tab>
        <Tab id='4'>Suspect High CPU</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Control/>
        </TabPanel>
        <TabPanel>
          <p>Content for tab 2</p>
          <Button>Click me</Button>
        </TabPanel>
        <TabPanel>
          <p>Content for tab 3</p>
          <Button>Click me</Button>
        </TabPanel>
        <TabPanel id='3'>
          <p>Content for tab 4</p>
          <Button>Click me</Button>
        </TabPanel>
      </TabPanels>
      </Tabs>
    </ChakraProvider>
  )
}

const rootElement = document.getElementById("root")
render(<App />, rootElement)
