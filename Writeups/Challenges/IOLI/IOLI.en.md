

## Overview

The **IOLI crackmes** were created several years ago with the goal of helping users learn **reverse engineering**, initially focusing on the use of **Radare2**.  
That said, the binaries can be analyzed with any disassembler or debugger. In my case, I use **IDA**.

All of the challenges share the following characteristics:

- Windows **x86 (32-bit)** binaries
- Progressive difficulty across the levels
- Focused on **static analysis and reversing**, not on exploitation

They start out very easy and gradually get harder as the levels go up. 

Since these challenges are designed for reversing, for me the main challenge isn't getting a flag, but learning as much as possible about the binary using IDA (in my case).

As a result, several of the challenges are very similar to each other and only differ in the internal layout of the functions or variables.

## IOLI Level 0x00

The very first challenge: we just use the strings command to look at the binary's text strings and we'll clearly find the password

![1](</Writeups/Challenges/IOLI/img/Level 0x00/img/1.png>)

We try the password 250382 and we can see that it accepts it

![1](</Writeups/Challenges/IOLI/img/Level 0x00/img/2.png>)

We can also do this with IDA, either by looking at the program flow

![1](</Writeups/Challenges/IOLI/img/Level 0x00/img/3.png>)

Or by using strings in IDA from the **View → Open subviews → Strings** menu

![1](</Writeups/Challenges/IOLI/img/Level 0x00/img/4.png>)

## IOLI Level 0x01

In this second challenge we can see that we're not able to spot the password with strings

![1](</Writeups/Challenges/IOLI/img/Level 0x01/img/1.png>)

So we can take a look with IDA or Ghidra

In my case I'm going to show it in IDA: if we look at the C pseudocode of this program's Main function we can clearly see that it does an if checking that the password is 5274

*To view this pseudocode we go to the function and press F5*

![1](</Writeups/Challenges/IOLI/img/Level 0x01/img/2.png>)

We check and, sure enough, that's the password

![1](</Writeups/Challenges/IOLI/img/Level 0x01/img/3.png>)

We can also do it without the pseudocode: we look in IDA for a CMP instruction in assembly, which is used to compare values, and we see this

![1](</Writeups/Challenges/IOLI/img/Level 0x01/img/4.png>)

if we look at the value it's comparing against, which is 149A, and convert it to decimal we'll get 5274, which is the password

*the h at the end of the value is just there to indicate that it's in hexadecimal*

## IOLI Level 0x02

In this one we can do the same as before and look at the pseudocode, which will give us the password; this challenge actually performs a series of calculations to arrive at that number, but IDA does it automatically behind the scenes

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/1.png>)

If we want to properly understand what the challenge is about we can go to the assembly instructions and break them down step by step; these are the instructions that generate the password

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/2.png>)

Let's work through it step by step
It starts by assigning the values 5A (90 in decimal) to var_8 and 1EC (492 in decimal) to var_C

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/3.png>)

Then it moves the value of var_C into edx 

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/4.png>)

Now it puts the memory address of var_8 into eax

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/5.png>)

So essentially we have 90 in edx and var_8 in eax

Now what it does is add edx to eax (the sum stays in eax, and since eax holds the memory address of var_8 it ends up at that memory address), which gives 582
So now `var_8 = 582`

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/6.png>)

Now that var_8 holds the value 582 it moves that value into eax, so `eax = 582`

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/7.png>)

With imul we multiply, in this case we multiply `eax = 582 * var_8 = 582`, which gives us `eax = 338724`, which is this challenge's password

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/8.png>)

The rest of the instructions just move the password into var_C to compare it against the input the user provides, which will be stored in var_4

Now we can check whether the password is correct

![1](</Writeups/Challenges/IOLI/img/Level 0x02/img/9.png>)

## IOLI Level 0x03

As always we load the file into IDA and we see that, as before, the pseudocode already gives us the answer

![1](</Writeups/Challenges/IOLI/img/Level 0x03/img/1.png>)

Let's still take a look at the process behind it

![1](</Writeups/Challenges/IOLI/img/Level 0x03/img/2.png>)

This one is very similar to the previous one, the only difference is the final part, where the comparison adds 18 to the value of the final password; it also adds 18 to our input, so the password will be the same 

We can also see that the comparison is in another function

![1](</Writeups/Challenges/IOLI/img/Level 0x03/img/3.png>)

and that the text telling us whether the password is correct or incorrect isn't the same: a function called shift is being applied, and if we go into it we can see that what it does is rotate every character by -3 positions

![1](</Writeups/Challenges/IOLI/img/Level 0x03/img/4.png>)

If we check it with CyberChef we can see the correct message come out; none of this is necessary since we already have the password, but it's interesting

![1](</Writeups/Challenges/IOLI/img/Level 0x03/img/5.png>)

Let's verify that this really is the right password and move on to the next challenge

![1](</Writeups/Challenges/IOLI/img/Level 0x03/img/6.png>)

## IOLI Level 0x04

We start by inspecting the file with IDA, we go into Main and this time we see something curious

![1](</Writeups/Challenges/IOLI/img/Level 0x04/img/1.png>)

There are no comparisons anywhere, and if we look at the pseudocode we won't see the password like before either, but if we look closely there are two functions being called, `_scanf` and `_chek` 

The `_scanf` function has nothing to it, but `_chek` has something interesting

![1](</Writeups/Challenges/IOLI/img/Level 0x04/img/2.png>)

To avoid going through the assembly instruction by instruction we can look at the pseudocode IDA generates for us and we'll see this 

![1](</Writeups/Challenges/IOLI/img/Level 0x04/img/3.png>)

This looks more promising: we can see it iterating over each character of our input and adding it to the variable v4; at the end of the loop that variable will hold the sum of all the digits of our password and it's compared against 15

*In IDA we can rename variables to make things easier to read*

![1](</Writeups/Challenges/IOLI/img/Level 0x04/img/4.png>)

So let's check whether this reasoning is correct

![1](</Writeups/Challenges/IOLI/img/Level 0x04/img/5.png>)

And just as we assumed, it works

## IOLI Level 0x05

We do the usual and inspect the file with IDA; we find a challenge very similar to the previous one, except this time it compares against 16 instead of 15

![1](</Writeups/Challenges/IOLI/img/Level 0x05/img/1.png>)

So we can try entering 79, for example

![1](</Writeups/Challenges/IOLI/img/Level 0x05/img/2.png>)

It doesn't work; if we go back to the code we notice that it goes into the parell function after the if, and if we go into that function we'll see that it performs an additional check

![1](</Writeups/Challenges/IOLI/img/Level 0x05/img/3.png>)

It's checking whether the password we supplied is even, and if it is it gives us the OK

So instead of 79 we can try something like 88

![1](</Writeups/Challenges/IOLI/img/Level 0x05/img/4.png>)

And sure enough we get in without any trouble

## IOLI Level 0x06

On to the seventh challenge: we do the same as the previous ones and go straight to IDA to analyze the binary

Now check is being passed the password we enter along with an environment variable

![1](</Writeups/Challenges/IOLI/img/Level 0x06/img/1.png>)

Inside check there's a parell function which at first glance looks the same as in the previous challenge, but if we look carefully we can see that this time it's passing 2 arguments to parell, our password and the environment variable

![1](</Writeups/Challenges/IOLI/img/Level 0x06/img/2.png>)

Let's see what changed in the parell function: we can see a couple of new things, but the most interesting one is that it creates a variable called result which stores the value returned by passing our password and the environment variable to a new function called dummy; let's take a look at this new function.

*I don't know exactly why the loop runs 10 times if dummy is correct, but it doesn't affect anything*

![1](</Writeups/Challenges/IOLI/img/Level 0x06/img/3.png>)

This dummy function seems to be running a loop and comparing the first three characters of the environment variable against LOLO

![1](</Writeups/Challenges/IOLI/img/Level 0x06/img/4.png>)

So following that logic, if we create an environment variable whose name starts with LOL we should pass this check

![1](</Writeups/Challenges/IOLI/img/Level 0x06/img/5.png>)

And it does indeed work

## IOLI Level 0x07

In this challenge we don't have a `_main`, so IDA drops us straight into the start function; this function doesn't have much to it, so let's go looking for the program's main code

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/1.png>)

We go to `sub_401140` and we'll see that it doesn't have anything interesting either, but at the end of it it calls the first function of the program's main code, so I renamed it to `_main`

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/2.png>)

If we look at its pseudocode we'll see that everything is the same as in the previous challenges; I'm going to rename the functions as I go so it's easier for me to follow the program flow, so let's check whether anything changed in the function that validates our password, which I've called check

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/3.png>)

Here we have a small change: where the "Wrong password" message used to be there's now a function

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/4.png>)

If we go into this function we'll see that it only contains the message, so it's of no use to us

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/5.png>)

So let's go into the second validation function to see whether there's anything different

Everything is very similar, but we can see there's an extra check where it verifies that dword_406030 holds the value 1 before giving us the OK

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/6.png>)

We can look at what value this variable holds and we'll see that it gets its value directly from the function I renamed as `check_envp`, which is the one that checks that the environment variable starts with LOL

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/7.png>)

So let's look at this function and, sure enough, it's setting this variable to 1 when the check passes

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/8.png>)

So this will pass if we do the previous challenge's step correctly; it looks like a second check but it doesn't affect us at all

We verify by doing the same as in the previous challenge and we see that it lets us through without any trouble

![1](</Writeups/Challenges/IOLI/img/Level 0x07/img/9.png>)

## IOLI Level 0x08

On to the second to last of these crackmes; in this case we have a `_main` again, and it looks very similar to all the previous ones, so let's look at the `check` function

![1](</Writeups/Challenges/IOLI/img/Level 0x08/img/1.png>)

All the same so far; the `che` function is the one that tells you the password is wrong, so not much change there either

![1](</Writeups/Challenges/IOLI/img/Level 0x08/img/2.png>)

parel looks exactly the same as before, but with the names already assigned, so it's clear that the LOL variable is for the environment variable check

![1](</Writeups/Challenges/IOLI/img/Level 0x08/img/3.png>)

The `dummy` function is the same too, so it looks like everything is the same as in challenge 0x07

![1](</Writeups/Challenges/IOLI/img/Level 0x08/img/4.png>)

So we can try doing the same thing and, sure enough, we get the OK

![1](</Writeups/Challenges/IOLI/img/Level 0x08/img/5.png>)

I'm not really sure what this challenge was for; I take it it's the tidied-up version of 0x07, but there isn't much to it beyond that

## IOLI Level 0x09

Alright, once again we don't have a `_main`, so we start in the `start` function

![1](</Writeups/Challenges/IOLI/img/Level 0x09/img/1.png>)

we'll do everything as in challenge 0x07 until we find the main code

![1](</Writeups/Challenges/IOLI/img/Level 0x09/img/2.png>)

Now let's go function by function to see whether there's anything new; check looks the same, the same validations are performed. 
That the sum of the digits equals 0x10 (16 in decimal) and, if that first condition holds, the `check2` function is called, which performs the rest of the checks.

![1](</Writeups/Challenges/IOLI/img/Level 0x09/img/3.png>)

And `check2` also looks the same: it passes the environment variable to `check_envp` so it can verify that it starts with LOL, then it checks that the password is even, and afterwards it checks once again that the environment variable is correct

![1](</Writeups/Challenges/IOLI/img/Level 0x09/img/4.png>)

We can test it and it works just like the previous ones

![1](</Writeups/Challenges/IOLI/img/Level 0x09/img/5.png>)

One thing I did notice that's different from the others is that in this case almost all the code is in the `check` variable; from IDA, looking at the assembly code, we can see almost the entire block of instructions from here

There's also a lot of unnecessary code which I take it is there to get in the way of the reversing

![1](</Writeups/Challenges/IOLI/img/Level 0x09/img/6.png>)

And that's all!