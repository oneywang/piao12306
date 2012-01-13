#ifndef IC_CA_INSTALLER_H__
#define IC_CA_INSTALLER_H__

class ICCAInstaller
{
public:
  static ICCAInstaller* CreateInstance();
  virtual void DeleteInstance() = 0;
  virtual bool IsCertAlreadyInstalled() = 0;
  virtual bool InstallCert() = 0;
};

#endif
