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

#include "CAInstaller.h"

#include <Windows.h>
#include <Wincrypt.h>
#include <Cryptuiapi.h>
#include <Shlwapi.h>
#pragma comment(lib, "Crypt32.lib")
#pragma comment(lib, "Cryptui.lib")
#pragma comment(lib, "shlwapi.lib")

#include "..\resource.h"

#define MY_ENCODING_TYPE (PKCS_7_ASN_ENCODING | X509_ASN_ENCODING)

namespace {

  bool IsOsVersionVistaOrAfter() {
    OSVERSIONINFOEX version_info = { sizeof version_info };
    if(GetVersionEx(reinterpret_cast<OSVERSIONINFO*>(&version_info)))
      if (version_info.dwMajorVersion >= 6)
        return true;
    return false;
  }

  bool CloseTheDialog() {
    LPCTSTR lpDlgTitle = 
      IsOsVersionVistaOrAfter() ? TEXT("安全性警告") : TEXT("安全警告");
    LPCTSTR lpStaticTitle=
      TEXT("您即将从一个声称代表如下的证书颁发机构安装证书");

    HWND hDlgWnd = ::FindWindow(TEXT("#32770"), lpDlgTitle);
    if (::IsWindow(hDlgWnd))
    {
      HWND hPreStatic = NULL;
      TCHAR szTextBuf[MAX_PATH] = {0};
      bool bContinue = false;

      for (int i=0; i<3; i++)
      {
        HWND hStatic = ::FindWindowEx(hDlgWnd, hPreStatic, TEXT("STATIC"), NULL);
        ::GetWindowText(hStatic, szTextBuf, MAX_PATH);
        if (StrStrI(szTextBuf, lpStaticTitle))
        {
          bContinue = true;
          break;
        }
        hPreStatic = hStatic;
      }

      if (bContinue)
      {
        HWND hBtn = ::FindWindowEx(hDlgWnd, NULL, TEXT("BUTTON"), TEXT("是(&Y)"));
        if (::IsWindow(hBtn))
        {
          ::PostMessage(hBtn, BM_CLICK, 0, 0);
          return true;
        }
      }
    }
    return false;
  }

  // 超过10秒则需要用户自己手动关对话框==
  DWORD TimerThread(LPVOID pvoid) {
    for (int i = 0; i< 100; ++i) {
      Sleep(100);
      if(CloseTheDialog())
        return 0;
    }
    return 1;
  }
}
ICCAInstaller* ICCAInstaller::CreateInstance() {
  return new CCAInstaller();
}

CCAInstaller::CCAInstaller(void) {
}

CCAInstaller::~CCAInstaller(void) {
}

void CCAInstaller::DeleteInstance() {
  delete this;
}

bool CCAInstaller::IsCertAlreadyInstalled() {
  LPCTSTR lpszName = TEXT("SRCA");
  return IsCertExist(lpszName);
}

bool CCAInstaller::InstallCert() {
  return ImportCert(TRUE);
}

//////////////////////////////////////////////////////////////////////////
extern HMODULE g_hMod;
byte* CCAInstaller::PrepareCert(DWORD& dwSize) {
  HRSRC hRsrc = FindResource(g_hMod, MAKEINTRESOURCE(IDR_SRCA1), TEXT("SRCA"));
  if (!hRsrc) {
    int retCode = GetLastError();
    return NULL;
  }

  dwSize = SizeofResource(g_hMod, hRsrc);
  if (0 == dwSize)
    return NULL;

  HGLOBAL hGlobal = LoadResource(g_hMod, hRsrc);
  if (!hGlobal)
    return NULL;

  LPVOID lpCert = LockResource(hGlobal);
  if (!lpCert)
    return NULL;
  
  return reinterpret_cast<byte*>(lpCert);
}
//导入证书
//lpSrc 证书路径
//12306导入的是根证书,这里传入TRUE
bool CCAInstaller::ImportCert(BOOL bRoot, BOOL bPfx, LPCTSTR lpPasswd) {
  //prepare the resource.
  DWORD dwSize = 0;
  byte* pSrc = reinterpret_cast<byte*>(PrepareCert(dwSize));
  if (!pSrc)
    return false;

  // prepare the context.
  PCCERT_CONTEXT pCertCon = CertCreateCertificateContext(
    MY_ENCODING_TYPE, pSrc, dwSize);
  if (!pCertCon)
    return false;

  CRYPTUI_WIZ_IMPORT_SRC_INFO importSrc;
  memset(&importSrc, 0, sizeof(CRYPTUI_WIZ_IMPORT_SRC_INFO));
  importSrc.dwSize = sizeof(CRYPTUI_WIZ_IMPORT_SRC_INFO);
  importSrc.dwSubjectChoice = CRYPTUI_WIZ_IMPORT_SUBJECT_CERT_CONTEXT;
  importSrc.pCertContext = pCertCon;
  if (bPfx)
    importSrc.pwszPassword = lpPasswd;
  importSrc.dwFlags = CRYPT_EXPORTABLE | CRYPT_USER_PROTECTED;

  HCERTSTORE  hSystemStore;  // system store handle
  //--------------------------------------------------------------------
  // Open the CA system certificate store. The same call can be
  // used with the name of a different system store, such as Mqy or Root,
  // as the second parameter.

  if (hSystemStore = CertOpenSystemStore(0, bRoot ? TEXT("ROOT") : TEXT("CA")))
  {
    StartTimerThread();
    CryptUIWizImport(CRYPTUI_WIZ_NO_UI, NULL, NULL, &importSrc, hSystemStore);
    CertCloseStore(hSystemStore, 0);
    return true;
  }
  return false;
}
void CCAInstaller::StartTimerThread() {
  HANDLE hThread = CreateThread(NULL, 0, (LPTHREAD_START_ROUTINE)TimerThread, NULL, 0, NULL);
  if (hThread)
    CloseHandle(hThread);
}
bool CCAInstaller::IsCertExist(LPCTSTR lpszName) {
  bool bRet =false;

  HCERTSTORE  hSystemStore = NULL;  // system store handle
  PCCERT_CONTEXT  pDesiredCert = NULL; 
  //--------------------------------------------------------------------
  // Open the CA system certificate store. The same call can be
  // used with the name of a different system store, such as Mqy or Root,
  // as the second parameter.
  hSystemStore = CertOpenStore(
    CERT_STORE_PROV_SYSTEM,
    0,
    NULL, 
    CERT_SYSTEM_STORE_CURRENT_USER,
    TEXT("ROOT"));
  if (hSystemStore) {
    pDesiredCert = CertFindCertificateInStore(
      hSystemStore, MY_ENCODING_TYPE, 0, CERT_FIND_SUBJECT_STR, lpszName, NULL);
  }

  if (pDesiredCert)
  {
    bRet = true;
  }

  if (pDesiredCert)
  {
    CertFreeCertificateContext(pDesiredCert);
  }
  if (hSystemStore)
  {
    CertCloseStore(hSystemStore, 0);
  }
  return bRet;
}

