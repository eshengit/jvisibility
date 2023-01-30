import java.util.ArrayList;
import java.util.List;

class HighCPUThread implements Runnable{
    public static void exampleHighCPU(){
        while (true) {
            for (int i = 0; i < 1000000000; i++) {
                Math.sqrt(i);
            }
        }
    }
    public void run(){
        exampleHighCPU();
    }
}

class SlowWaitingThread implements Runnable{
    public static void slowWaiting(){
        while (true) {
            try{
                Thread.sleep(5000);
            }catch (Exception e){

            }
        }
    }
    public void run(){
        slowWaiting();
    }
}

class DeadlockThread implements Runnable{
    private Object obj1;
    private Object obj2;

    public DeadlockThread(Object o1, Object o2){
        this.obj1=o1;
        this.obj2=o2;
    }
    @Override
    public void run() {
        String name = Thread.currentThread().getName();
        System.out.println(name + " acquiring lock on "+obj1);
        synchronized (obj1) {
            System.out.println(name + " acquired lock on "+obj1);
            work();
            System.out.println(name + " acquiring lock on "+obj2);
            synchronized (obj2) {
                System.out.println(name + " acquired lock on "+obj2);
                work();
            }
            System.out.println(name + " released lock on "+obj2);
        }
        System.out.println(name + " released lock on "+obj1);
        System.out.println(name + " finished execution.");
    }
    private void work() {
        try {
            Thread.sleep(30000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
public class Example {

    public static void startDeadlock() throws InterruptedException{
        Object obj1 = new Object();
        Object obj2 = new Object();
        Object obj3 = new Object();

        Thread d1 = new Thread(new DeadlockThread(obj1, obj2), "deadlock-1");
        Thread d2 = new Thread(new DeadlockThread(obj2, obj3), "deadlock-2");
        Thread d3 = new Thread(new DeadlockThread(obj3, obj1), "deadlock-3");

        d1.start();
        Thread.sleep(5000);
        d2.start();
        Thread.sleep(5000);
        d3.start();
    }

    public static void startHighCPU(){
        Thread cpu = new Thread(new HighCPUThread(), "highCPUThread");
        cpu.start();
    }

    public static void startSlowWaiting(){
        Thread slow = new Thread(new SlowWaitingThread(), "SlowIOWaitingThread");
        slow.start();
    }


    public static void main(String[] args) throws InterruptedException {
        startDeadlock();
        startHighCPU();
        startSlowWaiting();
    }
}
