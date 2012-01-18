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

#include "helper_script_object.h"
#include "script_object_factory.h"
#include "helper_plugin.h"

//extern Log g_Log;

NPObject* HelperScriptObject::Allocate(NPP npp, NPClass *aClass) {
  HelperScriptObject* pRet = new HelperScriptObject();
  //char logs[256];
  //sprintf(logs, "HelperScriptObject this=%ld", pRet);
  //g_Log.WriteLog("Allocate",logs);
  if (pRet != NULL) {
    pRet->set_plugin((PluginBase*)npp->pdata);
  }
  return pRet;
}

void HelperScriptObject::Deallocate() {
  //char logs[256];
  //sprintf(logs, "HelperScriptObject this=%ld", this);
  //g_Log.WriteLog("Deallocate",logs);
  delete this;
}

void HelperScriptObject::InitHandler() {
  Function_Item item;
  item.function_name = "IsInstalled";
  item.function_pointer = ON_INVOKEHELPER(&HelperScriptObject::IsInstalled);
  AddFunction(item);
  item.function_name = "Install";
  item.function_pointer = ON_INVOKEHELPER(&HelperScriptObject::Install);
  AddFunction(item);
}

#include "install/ICAInstaller.h"

bool HelperScriptObject::IsInstalled(const NPVariant* args,
                                              uint32_t argCount,
                                              NPVariant* result) {
  
  BOOLEAN_TO_NPVARIANT(FALSE, *result);
  //g_Log.WriteLog("Script", "IsInstalled");

  ICCAInstaller* ca_installer = ICCAInstaller::CreateInstance();
  if (!ca_installer) {
    return true;
  }

  if (ca_installer->IsCertAlreadyInstalled()) {
    BOOLEAN_TO_NPVARIANT(TRUE, *result);
  }
  ca_installer->DeleteInstance();
  return true;
}

bool HelperScriptObject::Install(const NPVariant* args,
                                              uint32_t argCount,
                                              NPVariant* result) {
  
  BOOLEAN_TO_NPVARIANT(TRUE, *result);
  //g_Log.WriteLog("Script", "Install");

  ICCAInstaller* ca_installer = ICCAInstaller::CreateInstance();
  if (!ca_installer) {
    BOOLEAN_TO_NPVARIANT(FALSE, *result);
    return true;
  }

  if (!ca_installer->IsCertAlreadyInstalled()) {
    if(!ca_installer->InstallCert()) {
      BOOLEAN_TO_NPVARIANT(FALSE, *result);
    }
  }
  ca_installer->DeleteInstance();
  return true;
}
