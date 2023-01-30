# Jvisibility: A light-weight JVM profiling Application. 

## The Major Features:  

- Visibility added to your JVM experiencing slowenss, help **easily and quickly identify root cause**.  
- Profiling JVM **all** the time, in **production**, **No performance penality**. Deploy profiling agent has **zero performance overhead**.     

## A demo demonstrates the major features:  

### The scenario and the setup: 
- An java Application [example.java](https://github.com/eshengit/jvisibility/blob/main/agent-backend/tests/test-resources/Example.java) has problem of high CPU consumption, deadlock and other network or IO related slowness. 
- The profiling agent is deployed along with this problematic JVM application.


### How to run demo(Prerequisite: assume you have Docker Desktop installed): 

```
1. git clone git@github.com:eshengit/jvisibility.git
2. cd jvisibility
3. ./build-images.sh
4. docker-compose up
```

### Diagnosis the root cause with in a friendly UI 
- **Manage** the JVM you want to profile by entering the name of JVM application. 


   ![text](https://github.com/eshengit/jvisibility/blob/main/Control.png) 
   
   
- **Deadlock checking**


  ![text](https://github.com/eshengit/jvisibility/blob/main/Deadlock.png) 
  
  
- **CPU spike checking**:if there is ongoing user CPU spike or system CPU spike. If there is any, identifying the offending thread(i.e, GC thread, application thread). By default, it will check CPU spike at the moment with 1 min time granularity and then iterate through the historical records one by one by click "get next". 


![text](https://github.com/eshengit/jvisibility/blob/main/CPU.png) 


- **General Slowness checking**: thread starving, long network or IO waiting can cause slowness, but without showing explicit deadlock and CPU usage is even low. We want to find out what the JVM is working on, however, a thread dump is difficult to read if there are thousands of threads. the general JVM stats check help you iterate through a MB size thread dump using simple summary. How many totoal threads? How many different thread groups? In a given thread group, how many unique stack traces? 1000 threads in the same thread group may have only 1 unique stack trace, and we can quickly scan a lengthy thread dump at ease and quicky understand what's going on.    


![text](https://github.com/eshengit/jvisibility/blob/main/Slowness.png) 
