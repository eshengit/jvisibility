import React, {useEffect, useState} from "react";
import {Box, Button, Collapse, Td, Tr} from "@chakra-ui/react";
import PropTypes from 'prop-types';

export default function ExpandableStats({trace}) {
 const [show, setShow] = useState(false);

 const trace_to_count_map = trace.variation_map_per_thread_group
const myMap = 
  {"Key 1": "Value 1",
  "Key 2": "Value 2",
  "Key 3": "Value 3"}
;
 

 const handleToggle = () => {
      setShow(!show);
 };

 return (
   <Tr key={trace.thread_group_name}>
   <Td >{trace.thread_group_name}</Td>
   <Td >{trace.total_thread_count}</Td>
   <Td> 
     <Button colorScheme="facebook" onClick={handleToggle}>
             Expand {trace.trace_variation_count} variations: 
      </Button>
     {show && Object.keys(trace_to_count_map).map(key => (
          <Tr key={key}>
            <Td>{key}</Td>
            <Td>{trace_to_count_map[key]}</Td>
          </Tr>
     ))}
   </Td>
  </Tr> 
 );
}

ExpandableStats.propTypes = {
 trace: PropTypes.any.isRequired
}