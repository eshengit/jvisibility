import React, {useEffect, useState} from "react";
import { Box, Button, Collapse, Radio, Flex, Input, FormControl, FormErrorMessage, Stack, Text, Table, Tbody, Tr, Td, Thead, Th} from "@chakra-ui/react";
import PropTypes from 'prop-types';
import {getCPUReport} from "./API"
import moment from "moment"
import ExpandableCPU from "./ExpandableCPU"


export default function CPU({isSelected}) {
  const [cpuAnalysisMode, setCpuAnalysisMode] = useState("User");
  const [startDate, setStartDate] = useState();
  const [isValid, setIsValid] = useState(true);
  const [cpuReport, setCpuReport] = useState({});
  const [displayReport, setDisplayReport] = useState(false);
  const [useCurrentTime, setUseCurrentTime] = useState("Current");
  const [currentTimeString, setCurrentTimeString] = useState();
  const [currentMoment, setCurrentMoment] = useState();
 

  useEffect(() => {
    if (isSelected){
      console.log("cpu jsx is selected")
    }
  }, [isSelected])
 
  useEffect(() => {
    if(isSelected)
      onCPUAnalysisModeChange();
  }, [cpuAnalysisMode]);

const handleRefresh = () => {
    setCurrentMoment(undefined)
    setCurrentTimeString(undefined)
  }
const useCurrentTimeMode = () => {return useCurrentTime === 'Current'}
const moveNext = () => {
  if(useCurrentTimeMode){
      let new_moment = moment(currentMoment).subtract(51, 'seconds');
      setCurrentMoment(new_moment);
      setCurrentTimeString(new_moment.format('YYYY/MM/DD:HH:mm:ss')) 
  }else{
      let new_moment = moment(startDate, 'YYYY/MM/DD:HH:mm:ss')
      setStartDate(moment(new_moment).subtract(51, 'seconds').format('YYYY/MM/DD:HH:mm:ss')) 
  }
}
const handleFetchCPUReport = async () => {
      var startTime
      if(useCurrentTimeMode){
        var m,ms
        if (typeof currentMoment === 'undefined'){
          m = moment()
          setCurrentMoment(m)
          ms = m.format('YYYY/MM/DD:HH:mm:ss')
          startTime = ms          
          setCurrentTimeString(ms)
        }else{
          startTime = currentTimeString
        }
        console.log("use current mode")
      }else{        
        startTime = startDate
        console.log("use user enter mode")      
      }

      if(typeof startTime === 'undefined')
        return 

      moveNext();  

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

const handleNextTime = (event) => {
      event.preventDefault();      
      handleFetchCPUReport();
}

const onCPUAnalysisModeChange = () => {
    handleFetchCPUReport()
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
      onChange = {e => setUseCurrentTime(e.target.value)}>Start From Most Recent Time</Radio> 
    <Radio mr={5}
     isChecked={useCurrentTime === "FromUser"} 
     value="FromUser" 
     onChange = {e => setUseCurrentTime(e.target.value)}>Start From Specific Time</Radio>
    <Box width="190px">
      <form onSubmit={handleNextTime}>
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

  
  <Flex>
     <form onSubmit={handleNextTime}>
      <Button mr={2} type="submit" colorScheme='facebook'>Get next</Button>
      <Button mr={2} colorScheme='facebook' onClick={handleRefresh}>Refresh Current</Button>
     </form>
  </Flex>

   <Flex>
      <Button w="100%" colorScheme='facebook'>
        Result 
      </Button>
    </Flex>
  {displayReport && 
   <Table variant='striped' colorScheme='facebook'>
     <Thead>
      <Tr>
        <Th># of CPU Ticks</Th>
        <Th>Stack Trace: {useCurrentTime? currentTimeString:startDate} </Th>
      </Tr>
    </Thead>
      <Tbody>
         {cpuReport.map((trace) => (
          <ExpandableCPU trace={trace}/>
        ))}   
      </Tbody>
    </Table> }

  </Stack>
  );
}

CPU.propTypes = {
 isSelected: PropTypes.bool.isRequired
}