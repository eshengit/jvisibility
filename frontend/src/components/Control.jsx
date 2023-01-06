import React, {useEffect, useState} from "react";
import { InputGroup, Input, InputLeftAddon, Button, Box, Textarea, Stack, List, ListItem, Divider} from '@chakra-ui/react';


export default function Control() {
  const [processName, setProcessName] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const getStatus = async () => {
    const response = await fetch("http://localhost:8080/")
    const statusResponse = await response.json()
    setStatusMsg(statusResponse)
}

  useEffect(() => {
    getStatus()
  }, [])

  const handleInput = (event) => {
      setProcessName(event.target.value)
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Send a POST request to the server with the value of the text field
    console.log(processName)
    fetch("http://localhost:8080/start", {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        p: processName,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    getStatus()
  };

  return (
    <Stack spacing={4}>
      <Button colorScheme='facebook'>Current Status</Button>
      <List>
      {Object.entries(statusMsg).map(([key, value]) => (
        <ListItem key={key} color={key !== 'SUCCESS' ? 'red.500' : 'green.500'}>
          {key}: {value}
        </ListItem>
      ))}
    </List>
    <form onSubmit={handleSubmit}>
      <Button type="submit" colorScheme='facebook'>Change</Button>
      <div>
      <Divider my={2} />
      </div>
       <Textarea
        value={processName}
        onChange={handleInput}
        placeholder='Enter JVM Process you want to profile'
        size='sm'/>
    </form>
    </Stack>
  );
}
