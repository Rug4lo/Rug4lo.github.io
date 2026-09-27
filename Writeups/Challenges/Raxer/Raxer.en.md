

# Overview

This challenge has the following specifications:

- **Techniques**: Static reverse engineering → Algorithm analysis → Automatic keygen
- **Challenge**: https://crackmes.one/crackme/5ed5b3c833c5d449d91ae6d0
- **Platform**: Windows - x64 (64-bit)
- **Language**: C/C++

# Solution

This time we're going to solve a simple Windows challenge from the crackmes.one platform.

We start by downloading the binary and running it. We see that it asks us for a password, as is usual in crackmes.

![1](</Writeups/Challenges/Raxer/img/1.png>)

We open IDA and take a look at this program's code.

This program has no Main function, but it does have a start function. We can see that this is where the main body of the program lives.

![1](</Writeups/Challenges/Raxer/img/2.png>)

We could solve this challenge using the pseudocode IDA provides, but since it's a simple challenge, let's get some practice with assembly.

I've highlighted the most important part of the code, but let's break it down piece by piece

![1](</Writeups/Challenges/Raxer/img/3.png>)

First it loads the memory address of `loc_400418` into `rax`

![1](</Writeups/Challenges/Raxer/img/4.png>)

And it moves this into `rsi`, so `rsi` ends up holding the memory address `loc_400410` 

![1](</Writeups/Challenges/Raxer/img/5.png>)

The program prints out several messages that aren't of interest to us
Until it stores in `r8` the memory address holding this string `BGOTHXIY`

![1](</Writeups/Challenges/Raxer/img/6.png>)

If we skip ahead a bit we can see that we're looking at a loop: it increments rax by 1 each iteration until it reaches `0D`, which in decimal is `13` ( if `rax` is not `13` it jumps to `loc_400452`, which is the start of the loop )

![1](</Writeups/Challenges/Raxer/img/7.png>)

So rax is an index and the loop runs 13 times. Since each iteration checks one character of our password, we can assume we need a 13-character password

Let's analyse the loop. The first thing it does is take the first character of the password we supply and store it in `dl`

![1](</Writeups/Challenges/Raxer/img/8.png>)

Then it adds `rax` + `rsi` (which points to `loc_400418`) and stores the result in `rcx`. This means that on the first iteration it holds the value at `loc_400418`, on the second iteration the one at `loc_400419`, and so on

![1](</Writeups/Challenges/Raxer/img/9.png>)

Now it performs an `and` on the value we stored in `rcx` against a `7`

![1](</Writeups/Challenges/Raxer/img/10.png>)

Internally what it's doing is taking the value in `ecx` (for example `0x48`), converting it to binary and comparing it with the number `7` in binary, applying the and bit by bit, and keeping the last 3 bits of the result:

```
01001000 ← ecx (0x48)
00000111 ← 7 
------------ 
00000000 ← resultado (coge los 3 ultimos bits)
```

This `and` operation yields a number from 0 to 7, which is exactly the length of the string `BGOTHXIY` stored in `r8`

So the next thing it does is use this value from 0 to 7 to index into that string `BGOTHXIY` (e.g. if the and gave us `3` it would take the `T`)
It compares that character with the one from our password, and does so all 13 times 

![1](</Writeups/Challenges/Raxer/img/11.png>)

Understanding this, we can write a script that replicates the process on our own machine, but for that we'll need the values at address `loc_400418`. We can see them in IDA's hex view: starting at `400418` and stepping forward 13 bytes we end up with these values

```
48, 8D, 05, F9, FF, FF, FF, 48, 89, C6, 48, 8D, 0D
```

![1](</Writeups/Challenges/Raxer/img/12.png>)

With this we have everything we need to write the script that  generates the password for us
In my case I wrote it in Python since that's what I'm most comfortable with

```python
eax = [0x48, 0x8D, 0x05, 0xF9, 0xFF, 0xFF, 0xFF, 0x48, 0x89, 0xC6, 0x48, 0x8D, 0x0D]

string = "BGOTHXIY"

def create_pass():
    i = 0
    password = ""
    while i != 13:
        idx = eax[i] & 7
        char = string[idx]
        password = char + password
        i += 1

    password = "".join(reversed(password)) # Invertimos la contraseña
    print("Final password:", password)
    print(f"Longitud: {len(password)} caracteres") 

if __name__ == '__main__':
    create_pass()
```

We run the script and it gives us the password `BXXGYYYBGIBXX`

![1](</Writeups/Challenges/Raxer/img/13.png>)

Finally we check whether this is the correct password

![1](</Writeups/Challenges/Raxer/img/14.png>)
