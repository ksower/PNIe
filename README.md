# PNIe

This is a program I made for my school graduation work. Please forgive me if the code is hard to understand.   
This program is a chrome extension. If you search for 'PNIe' in the Chrome Web Store, you can add it to your Chrome and use it.   
This program may be immature as it is not intended for commercialization.


## Intro

This program uses IPFS by default.   
IPFS, simply put, is file-distributed storage. For more information, check the url below.   
https://medium.com/@kblockresearch/8-ipfs-interplanetary-file-system-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-1%EB%B6%80-http-web%EC%9D%84-%EB%84%98%EC%96%B4%EC%84%9C-ipfs-web%EC%9C%BC%EB%A1%9C-46382a2a6539


This program allows users to upload and download files via IPFS.
I use JS-IPFS because it uses java script.
The goal was to allow users to upload and download files by group by creating groups, but the swarm key, which was used to distinguish networks in the existing IPFS, cannot be used here.
This had the effect of indirectly distinguishing networks through encryption before uploading files.
Although the public network is used, when a file is downloaded, only users belonging to the group can verify the file contents through decryption.


This program does not use a separate server to prevent packets from coming out due to unnecessary communication with the server.
I thought of a general Windows program, but considering the environment where you can use the Internet through Wi-Fi anywhere, it was developed as a Chrome extension so that it is not limited by hardware.


Use IPFS comfortably without writing any code.


## Main Functions
1. Upload/download files to IPFS
2. Manage file(hash) list
3. Network separation through file encryption and decryption
4. Send the hash code for the file by email


## Language
- Javascript
- library : react, JS-IPFS


## web store
https://chrome.google.com/webstore/detail/pnie/lakepcgfdaabjbibneokgppkjacbinfp?hl=ko
