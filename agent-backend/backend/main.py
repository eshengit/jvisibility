# This is a sample Python script.

# Press ⌃R to execute it or replace it with your code.
# Press Double ⇧ to search everywhere for classes, files, tool windows, actions, and settings.
import time

def concatenate(**kwargs):
    for arg in kwargs.keys():
        if arg == "ab":
            print(kwargs.get(arg))

def print_hi(name):
    # Use a breakpoint in the code line below to debug your script.
    if name in "PYCharmSSS":
        print(f'Hi, {name}')  # Press ⌘F8 to toggle the breakpoint.


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    print_hi('PyCharm')
    current_time = time.strftime("%y%m%d-%H%M%S")
    current_dir = time.strftime("%y%m%d%H")
    print(current_time)
    print(current_dir)
    concatenate(abc="ddddddddddddd")
    line = "501 95986 95937   0 Tue02PM ??         0:01.91 /Applications/bin/java IDEA CE.backend/Contents/jbr/Contents/Frameworks/jcef"
    array = line.split(None)
    test = {"abc": 2}
    print(test.get("abc"))
    if "/bin/java " in str(line):
        # Extract the process id from the line and return it
        tokens = line.split(None)
        for token in tokens:
            if "/bin/java" in str(token):
                index = token.rfind('/') + 1
                s = token[0:index]
                d = s + "jstack"
                print(d)

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
