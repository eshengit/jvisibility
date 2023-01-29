import React, {useEffect, useState} from "react";
import {Box, Button, Collapse, Td, Tr} from "@chakra-ui/react";
import PropTypes from 'prop-types';

export default function Expandable({trace}) {
 const [show, setShow] = useState(false);

const handleToggle = () => {
    setShow(!show);
};

const getFirstLine = (trace) => {
    if ( typeof trace.trace === 'undefined' ||  trace.trace === null)
      return ""
    var lines = trace.trace.split('\n')
    if (lines.length > 0){
        return lines[0]
    }else
        return trace
}

 return (
   <Tr key={trace.thread_id}>
   <Td key={trace.thread_id}>{trace.cpu_ticks}</Td>
   <Td>
      <Button key={trace.thread_id} colorScheme="facebook" onClick={handleToggle}>
              Expand
      </Button>
      {show? trace.trace : getFirstLine(trace)}
  </Td>
  </Tr> 
 );
}

Expandable.propTypes = {
 trace: PropTypes.any.isRequired
}