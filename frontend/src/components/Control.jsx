import React, {useEffect, useState} from "react";
import { Flex, Input, Button, Stack, Table, Tbody, Td, Th, Thead, Tr} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import "../App.css"
import { getServerStatus } from "./API"
import { updateProcessToProfile } from "./API"


export default function Control({isSelected}) {
  const [processName, setProcessName] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [count, setCount] = useState(0);
  const [alert, setAlert] = useState(false);
  const [loadChangeInput, setLoadChangeInput] = useState(true);
  

  const shouldLoadChangeInput = (jsonResponse) => {
    if (jsonResponse != null && jsonResponse.STATUS != null && jsonResponse.STATUS === 'SUCCESS'){
        setLoadChangeInput(false)   
    }else{
        setLoadChangeInput(true)
    }
  }

  const getStatus =  () => {
    console.log("start progress")
    setTimeout(() => {getStatusFromServer()}, (count == 0)? 0: 15000)
  }

  const getStatusFromServer =  () => {
      getServerStatus().then(jsonResponse => {
      setStatusMsg(jsonResponse)
      shouldLoadChangeInput(jsonResponse)
      console.log("status msg", jsonResponse.STATUS)
      console.log("end progress, status retrieved", (count == 0)? 0: 15000, count, jsonResponse)})
  }
  

  useEffect(() => {    
    if(isSelected){
      console.log("control jsx is selected")
      getStatus()
    }
  }, [count, isSelected])

  useEffect(() => {
    if(alert) {
      setTimeout(() => {
        setAlert(false);
      }, 2000)
    }
  }, [alert])

  const handleInput = (event) => {
      setProcessName(event.target.value)
  };

  const handleSubmit = (event) => {
    event.preventDefault();   
    // Send a POST request to the server with the value of the text field
    if(loadChangeInput){
      setLoadChangeInput(false)
      updateProcessToProfile(processName)
      setCount(count + 1)
      setAlert(true)      
    }else{     
      setLoadChangeInput(true)
    }
  };

  return (
    <Stack spacing={4}>
      <Button colorScheme='facebook'>Current Status</Button>
    
      <Table  variant='striped' colorScheme='facebook'>
      <Tbody>
        <Tr >
          <Td>Status</Td>
          <Td color={statusMsg.STATUS === 'SUCCESS' ? "green" : "red"}>{statusMsg.STATUS}</Td>
        </Tr>
        <Tr >
          <Td>Process Name</Td>
          <Td>{statusMsg['PROCESS NAME']}</Td>
        </Tr>
        <Tr >
          <Td>Details</Td>
          <Td>{statusMsg.MESSAGE}</Td>
        </Tr>
      </Tbody>
    </Table>
    <form onSubmit={handleSubmit}>
      {alert && <p>Change is made successful</p>}
       <Flex>     
        <Button mr={2} type="submit" colorScheme='facebook'>Change Process To Profile</Button>
        {loadChangeInput &&    
        <Input w="20%" mr={2} placeholder="process name to profile" value={processName} onChange={handleInput}/>
        }        
      </Flex>
    </form>
    </Stack>
  );
}

Control.propTypes = {
 isSelected: PropTypes.bool.isRequired
}