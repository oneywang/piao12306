#pragma once

#include <Windows.h>
#include "ICAInstaller.h"


class CCAInstaller : public ICCAInstaller
{
public:
  CCAInstaller(void);
  virtual ~CCAInstaller(void);

  virtual void DeleteInstance();
  virtual bool IsCertAlreadyInstalled();
  virtual bool InstallCert();

private:
  byte* PrepareCert(DWORD& dwSize);
  bool IsCertExist(LPCTSTR lpszName);
  void StartTimerThread();
  bool ImportCert(BOOL bRoot = FALSE, BOOL bPfx=FALSE, LPCTSTR lpPasswd=NULL);
};
