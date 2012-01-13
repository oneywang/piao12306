#include "ICAInstaller.h"
int main() {
  ICCAInstaller* ca_installer = ICCAInstaller::CreateInstance();
  bool al = ca_installer->IsCertAlreadyInstalled();
  if (!al){
    ca_installer->InstallCert();
  }
}
