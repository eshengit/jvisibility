import React, {useEffect, useState} from "react";
import ReactDOM from 'react-dom/client';
import { ChakraProvider, Tabs, TabList, TabPanels, Tab, TabPanel, EditableTextarea, Button, Box } from "@chakra-ui/react";
import Header from "./components/Header";
import Control  from "./components/Control";
import Deadlock  from "./components/Deadlock";
import CPU from "./components/CPU";

function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isSelected = (tabIndex) => {
      return tabIndex === selectedIndex
  }
  return (
    <ChakraProvider>
      <Header/>
      <Tabs defaultIndex={selectedIndex} onChange={(index) => {setSelectedIndex(index)}} variant="line">
      <TabList>
        <Tab >Manage Profiling</Tab>
        <Tab >Suspect Deadlock</Tab>
        <Tab >Suspect Slowness</Tab>
        <Tab >Suspect High CPU</Tab>
      </TabList>
      <TabPanels>
        <TabPanel index={0}>
          <Control isSelected={isSelected(0)}/>
        </TabPanel>
        <TabPanel index={1}>
         <Deadlock isSelected={isSelected(1)}/>
        </TabPanel>
        <TabPanel index={2}>
          <p>Content for tab 3</p>
          <Button>Click me</Button>
        </TabPanel>
        <TabPanel index={3}>
           <CPU isSelected={isSelected(3)}/>
        </TabPanel>
      </TabPanels>
      </Tabs>
    </ChakraProvider>
  )
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(<App />)


