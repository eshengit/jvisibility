import React, {useEffect, useState} from "react";
import { Box, Button, Collapse, Radio, Flex, Input, FormControl, FormErrorMessage, Stack, Text, Table, Tbody, Tr, Td, Thead, Th} from "@chakra-ui/react";
import PropTypes from 'prop-types';
import {getStatsReport} from "./API"
import moment from "moment"
import ExpandableStats from "./ExpandableStats"


export default function Stats({isSelected}) {
  const [statsReport, setStatsReport] = useState({});
  const [startDate, setStartDate] = useState("");
  const [displayReport, setDisplayReport] = useState(false);
  const [useCurrentTime, setUseCurrentTime] = useState("Current");
  const [currentTimeString, setCurrentTimeString] = useState();
  const [currentMoment, setCurrentMoment] = useState();

  useEffect(() => {
    if (isSelected){
      console.log("stats jsx is selected")
    }
  }, [isSelected])

  const handleNextTime = (event) => {
      event.preventDefault();
      handleFetchStatsReport()
  }

  const useCurrentTimeMode = () => {return useCurrentTime === 'Current'}

  const handleRefresh = () => {
    setCurrentMoment(undefined)
    setCurrentTimeString(undefined)
  }

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

  const handleFetchStatsReport = async () => {
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

      const json_response = await getStatsReport(startTime)
      const report = JSON.parse(json_response['MESSAGE'])
      console.log(json_response)

      if(report.length === 0){
          alert("no profiling record in time range:" + startTime)
          setDisplayReport(false)          
      }else{
        setStatsReport(report)
        setDisplayReport(true)
      }
  }

  return (
    <Stack spacing={5}>
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
      { useCurrentTimeMode && <Box> {currentTimeString} </Box>}
      { !useCurrentTime && <Box> {startDate} </Box>}
      <Button mr={2} colorScheme='facebook' onClick={handleRefresh}>Refresh Current</Button>
      <Button mr={2} type="submit" colorScheme='facebook'>Get next</Button>
     </form>
  </Flex>

  <Flex>
      <Button w="100%" colorScheme='facebook'>
        Result 
      </Button>
    </Flex>
  {displayReport &&
    <Table key="1" variant='striped' colorScheme='facebook'>
       <Thead>
        <Tr>
          <Th>Total Threads: {statsReport.total_thread_count}</Th>
          <Th>Total Unique Thread Groups: {statsReport.total_thread_group_count}</Th>
        </Tr>
        </Thead>
    </Table>
  }
  {displayReport && 
   <Table key="2" variant='striped' colorScheme='facebook'>
     <Thead>
      <Tr>
        <Th>Thread Group</Th>
        <Th>Thread Counts</Th>
        <Th># Of Distinct Traces</Th>
      </Tr>
    </Thead>
      <Tbody>
        {statsReport.thread_group_list.map((t) => (
          <ExpandableStats trace={t}/>
        ))} 
      </Tbody>
    </Table> }

  </Stack>
  );



}
Stats.propTypes = {
 isSelected: PropTypes.bool.isRequired
}