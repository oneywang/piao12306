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
#include "stdafx.h"

namespace  utils{

string unicode2utf8(wstring const& ws)
{
  if(ws.empty())  return "";

  assert(wcslen(ws.c_str()) == ws.length());
  
  int OutBufferLen = (int)((ws.length()+1)*3); // NOTE: utf8 maybe 3 bytes
  char* OutBuffer = new char[OutBufferLen];
  memset(OutBuffer,0,OutBufferLen);

  int Utf8Len = WideCharToMultiByte(
    CP_UTF8,
    0,
    ws.c_str(),
    (int)ws.length(),
    OutBuffer,
    OutBufferLen,
    NULL,
    NULL);

  assert(Utf8Len);
  string Ret = string(OutBuffer,Utf8Len);
  delete []OutBuffer;
  assert(strlen(Ret.c_str()) == Ret.length());
  return Ret;
}

wstring utf82unicode(string const& s)
{
  if(s.empty() || s.length()==0)  return L"";

  wchar_t* Buffer = new wchar_t[s.length()+1];
  memset(Buffer,0,(s.length()+1)*2);

  int UnicodeLen = MultiByteToWideChar(
    CP_UTF8,
    0, 
    s.c_str(),
    (int)(s.length()),
    Buffer,
    (int)(s.length()+1));
  _ASSERT(UnicodeLen);

  wstring Ret(Buffer,UnicodeLen);
  delete[] Buffer;
  return Ret;
}

wstring string2wstring(string const& p)
{
  // same as asci2unicode
  if(p.empty()) return wstring(L"");

  wchar_t* W = new wchar_t[p.length()+1];
  memset(W,0,(p.length()+1)*2);

  MultiByteToWideChar( CP_ACP, 0, p.c_str(),
    int(p.length()+1), W,
    (int)p.length()+1);

  wstring Ret = W;
  delete[] W;
  return Ret;
}

BOOL IsFileExists(LPCWSTR lpFile)
{
  if(PathFileExists(lpFile) && PathIsDirectory(lpFile) == FALSE )
    return TRUE;
  return FALSE;
}

wstring& ReplaceAll(wstring& str, const wstring& old_value, const wstring& new_value)
{ 
  while(true)
  {
    wstring::size_type pos(0);
    if((pos=str.find(old_value))!=wstring::npos)
      str.replace(pos,old_value.length(),new_value);
    else break;
  }
  return str; 
} 


string& ReplaceAllDistinct(string& str, string const& old_value, string const& new_value)
{
  for(string::size_type pos(0); pos!=string::npos; pos+=new_value.length())
  {
    if((pos=str.find(old_value,pos))!=string::npos)
      str.replace(pos,old_value.length(),new_value);
    else break; 
  }
  return str;
}

#include <Psapi.h>
#pragma comment(lib, "version.lib")
#pragma comment(lib, "Psapi.lib")
wstring GetExePathFromHWnd(HWND HWnd)
{
  wstring path;
  assert(HWnd != NULL);
  if(HWnd == NULL) goto EXIT;

  DWORD dwProcessId = 0;
  GetWindowThreadProcessId(HWnd, &dwProcessId);
  if (dwProcessId == 0) goto EXIT;

  HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION|PROCESS_VM_READ, FALSE, dwProcessId);
  if (!hProcess) goto EXIT;

  HMODULE hMod = NULL;
  DWORD dwNeeded;
  if(EnumProcessModules(hProcess, &hMod, sizeof(hMod), &dwNeeded))  {
    wchar_t szCurrentProcessPath[MAX_PATH + 1] = {0};
    GetModuleFileNameExW(hProcess, hMod, szCurrentProcessPath,  _countof(szCurrentProcessPath));
    assert(PathFileExistsW(szCurrentProcessPath));
    path = szCurrentProcessPath;
  }

  CloseHandle(hProcess);

EXIT:
  return path;
}

}