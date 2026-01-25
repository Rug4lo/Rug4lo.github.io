# IOLI - Writeups

This repository contains my notes and analysis of the **IOLI crackme challenges**, a classic set of binaries used to practice **binary reversing**.

🔗 **Original binaries**:  
https://github.com/Maijin/radare2-workshop-2015/tree/master/IOLI-crackme

## Overview

The **IOLI challenges** were created several years ago with the goal of helping users learn **reverse engineering**, originally focusing on the use of **Radare2**.  
However, the binaries are tool-agnostic and can be analyzed with any disassembler or debugger. In my case, I use **IDA**.

All challenges share the following characteristics:

- Windows **x86 (32-bit)** binaries  
- Progressive difficulty across levels  
- Focused on **static analysis and reversing logic**, not exploitation  

They start out very simple and gradually become more complicated as the levels increase. 

Since these challenges are designed for reversing, for me the main challenge is not to get a flag, but to learn as much as possible about this binary using IDA (in my case).

Therefore, there are several challenges that are very similar to each other and only change the internal composition of the functions or variables.

## Links

1. **Level 0x00** - [0x00.md](<Level 0x00/Level 0x00.md>)
2. **Level 0x01** - [0x01.md](<Level 0x01/Level 0x01.md>)
3. **Level 0x02** - [0x02.md](<Level 0x02/Level 0x02.md>)
4. **Level 0x03** - [0x03.md](<Level 0x03/Level 0x03.md>)
5. **Level 0x04** - [0x04.md](<Level 0x04/Level 0x04.md>)
6. **Level 0x05** - [0x05.md](<Level 0x05/Level 0x05.md>)
7. **Level 0x06** - [0x06.md](<Level 0x06/Level 0x06.md>)
8. **Level 0x07** - [0x07.md](<Level 0x07/Level 0x07.md>)
9. **Level 0x08** - [0x08.md](<Level 0x08/Level 0x08.md>)
10. **Level 0x09** - [0x09.md](<Level 0x09/Level 0x09.md>)
