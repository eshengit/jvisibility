import React, {useEffect, useState} from "react";
import ReactDOM from 'react-dom/client';
import { ChakraProvider, Tabs, TabList, TabPanels, Tab, TabPanel, EditableTextarea, Button, Box } from "@chakra-ui/react";
import Header from "./components/Header";
import Control  from "./components/Control";
import Deadlock  from "./components/Deadlock";
import CPU from "./components/CPU";
import Stats from "./components/Stats";

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
        <Tab >Suspect High CPU</Tab>
        <Tab >Suspect Slowness</Tab>
      </TabList>
      <TabPanels>
        <TabPanel index={0}>
          <Control isSelected={isSelected(0)}/>
        </TabPanel>
        <TabPanel index={1}>
         <Deadlock isSelected={isSelected(1)}/>
        </TabPanel>
        <TabPanel index={2}>
           <CPU isSelected={isSelected(2)}/>
        </TabPanel>
        <TabPanel index={3}>
          <Stats isSelected={isSelected(3)}/>
        </TabPanel>
      </TabPanels>
      </Tabs>
    </ChakraProvider>
  )
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(<App />)


