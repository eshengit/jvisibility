import React, {useEffect, useState} from "react";
import { Box, Button, Collapse, Radio, Flex, Input, FormControl, FormErrorMessage, Stack, Text, Table, Tbody, Tr, Td, Thead, Th} from "@chakra-ui/react";
import PropTypes from 'prop-types';
import {getCPUReport} from "./API"
import moment from "moment"
import Expandable from "./Expandable"


export default function CPU({isSelected}) {
  const [cpuAnalysisMode, setCpuAnalysisMode] = useState("User");
  const [startDate, setStartDate] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [cpuReport, setCpuReport] = useState({});
  const [displayReport, setDisplayReport] = useState(false);
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [currentTimeString, setCurrentTimeString] = useState();
  const [currentMoment, setCurrentMoment] = useState();
 

  useEffect(() => {
    if (isSelected){
      console.log("cpu jsx is selected")
    }
  }, [isSelected])

  useEffect(() => {
    onCurrentTimeUpdate();
  }, [currentMoment]);

  useEffect(() => {
    onCurrentTimeStringUpdate();
  }, [currentTimeString]);


const handleFetchReport = async (useCT) => {
      var startTime
      if(useCT)
        startTime = currentTimeString
      else
        startTime = startDate

      const json_response = await getCPUReport(startTime, cpuAnalysisMode)
      const report = JSON.parse(json_response['MESSAGE'])
      console.log(json_response)
        
      if(report.length === 0){
          alert("no profiling record in time range:" + startTime)
          setDisplayReport(false)          
      }else{
        setCpuReport(report)
        setDisplayReport(true)
      }
  };

const handleUserTime = (event) => {
      event.preventDefault();
      handleFetchReport(false)
 }

const onCurrentTimeUpdate = () => {
    if( typeof currentMoment === 'undefined')
      return 
    console.log(currentMoment)
    setCurrentTimeString(currentMoment.format('YYYY/MM/DD:HH:mm:ss'))
}

const onCurrentTimeStringUpdate = () => {
      console.log(setCurrentTimeString)
      handleFetchReport(true)
}

const handleCurrentTime = (event) => {
    event.preventDefault();
    if (typeof currentMoment === 'undefined'){
      console.log("no time set")
      setCurrentMoment(moment())
    }else{
      setCurrentMoment(moment(currentMoment).subtract(51, 'seconds')); 
    }
}

function handleBlur() {
    if (!startDate) {
      setIsValid(true);
      return;
    }

    // check if the string is in the format of "2022/01/20:09:15:10"
    const dateTimeRegex = /^\d{4}\/\d{2}\/\d{2}:\d{2}:\d{2}:\d{2}$/;
    if (!dateTimeRegex.test(startDate)) {
      setIsValid(false);
      return;
    }
    // check if the date and time is valid
    const date = new Date(startDate);
    if (isNaN(date.getTime())) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
  }
  

  return (
    <Stack spacing={5}>

    <Flex>
      <Button w="100%" colorScheme='facebook'>
        Analyze By CPU Type
      </Button>
    </Flex>

    <Flex>
    <Radio mr={5}
        isChecked={cpuAnalysisMode === "User"}
        value="User"
        onChange={(e) => setCpuAnalysisMode(e.target.value)}>User CPU</Radio>
    <Radio mr={5}
        isChecked={cpuAnalysisMode === "Sys"}
        value="Sys"
        onChange={(e) => setCpuAnalysisMode(e.target.value)}>Sys CPU</Radio>
    </Flex>

    <Flex>
      <Button w="100%" colorScheme='facebook'>
        Pick Time Range To Analyze 
      </Button>
    </Flex>
    
  <Flex>
     <Radio mr={5} 
      isChecked={useCurrentTime === "Current"} 
      value="Current" 
      onChange = {e => setUseCurrentTime(e.target.value)}>Use Most Recent</Radio> 
     <form onSubmit={handleCurrentTime}>
      <Button mr={2} type="submit" colorScheme='facebook'>Get next</Button>
     </form>
  </Flex>

  <Flex>
     <Radio mr={5}
     isChecked={useCurrentTime === "FromUser"} 
     value="FromUser" 
     onChange = {e => setUseCurrentTime(e.target.value)}>Enter Time    </Radio>
    <Box width="190px">
      <form onSubmit={handleUserTime}>
        <FormControl>
          <Input mr={5}
          type="text"
          placeholder="2023/01/20:09:15:10"
          value={startDate}
          onChange={e=> {setStartDate(e.target.value)}}/>
        </FormControl>
       </form>
    </Box>
  </Flex>

  {displayReport && 
   <Table variant='striped' colorScheme='facebook'>
     <Thead>
      <Tr>
        <Th># of CPU Ticks</Th>
        <Th>Trace</Th>
      </Tr>
    </Thead>
      <Tbody>
         {cpuReport.map((trace) => (
          <Expandable trace={trace}/>
        ))}   
      </Tbody>
    </Table> }

  </Stack>
  );
}

CPU.propTypes = {
 isSelected: PropTypes.bool.isRequired
}