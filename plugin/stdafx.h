/*
 *  12306 Booking Helper Extension for Google Chrome and Chrome-base browsers such as 360chrome.
 *  Copyright (C) 2012 Landman
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 * 
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */
#ifndef STDAFX_H_
#define STDAFX_H_

#define  _CRT_SECURE_NO_WARNINGS

#define WIN32_LEAN_AND_MEAN    // Exclude rarely-used stuff from Windows headers

#include <winsock2.h>   // for Winsock API
#include "mswsock.h"
#include <windows.h>    // for Win32 APIs and types
#include <ws2tcpip.h>   // for IPv6 support
#include <wspiapi.h>    // for IPv6 support
#include <process.h>
#include <sddl.h>
#include "iphlpapi.h"
#include <tchar.h>
#include <Shlwapi.h>
#include <io.h>

#include <windowsx.h>

typedef unsigned (__stdcall *PTHREAD_START) (void*);

#define CREAT_THREAD(psa,cbStack,pfnStartAddr,  \
  pvParam, fdwCreate, pdwThreadID)      \
  ((HANDLE) _beginthreadex(          \
  (void*)(psa),                \
  (unsigned) (cbStack),            \
  (PTHREAD_START) (pfnStartAddr),        \
  (void*)(pvParam),              \
  (unsigned)(fdwCreate),            \
  (unsigned*)(pdwThreadID)))


#include <errno.h>
#include <time.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <iostream>
#include <string>
#include <list>
#include <vector>
#include <algorithm>

using namespace std;

#ifndef uint8
typedef unsigned char uint8;
#endif
#ifndef uint16
typedef unsigned short uint16;
#endif
#ifndef uint32
typedef unsigned long uint32;
#endif
#ifndef uint64
typedef ULONGLONG uint64;
#endif

#ifndef int8
typedef char int8;
#endif
#ifndef int16
typedef short int16;
#endif
#ifndef int32
typedef long int32;
#endif
#ifndef int64
typedef LONGLONG int64; 
#endif

#ifndef IN
#define IN
#endif

#ifndef OUT
#define OUT
#endif

#ifndef INOUT
#define INOUT
#endif

const char kPluginName[] = "piao helper";
const char kMIMEType[] = "application/x-np-piao";// !!remember to modify the .rc!!

#endif