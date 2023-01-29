import React, {useEffect, useState} from "react";
import { InputGroup, Input, InputLeftAddon, Button, Box, Textarea, Stack, List, ListItem, Divider} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import { getServerDeadlock } from './API'

 export default function Deadlock({ isSelected }) {
 
  const [deadlock, setDeadlock] = useState(false);
  const [deadlockTrace, setDeadlockTrace] = useState('');

  useEffect(() => {
    if (isSelected){
      console.log("deadlock jsx is selected")
      getDeadlock()
    }
  }, [isSelected])

  const getDeadlock =  async () => {
  
    // Send a POST request to the server with the value of the text field      
    const response_json = await getServerDeadlock()
    const trace_stats = JSON.parse(response_json['MESSAGE']);
               
    if (Object.keys(trace_stats).length === 0){
      setDeadlock(false)
      setDeadlockTrace("\n")
      console.log("no deadlock", trace_stats)
    }else{
        console.log("deadlock value", trace_stats.has_deadlock)
        setDeadlock(trace_stats.has_deadlock);
        setDeadlockTrace(trace_stats.deadlock_trace)
    }
  };
 
  return (
       <Stack spacing={4}>
       <Box>Deadlock:{deadlock}</Box>     
       <TextareaAutosize  value={deadlockTrace} />
       </Stack>
  );
}
Deadlock.propTypes = {
 isSelected: PropTypes.bool.isRequired
}
