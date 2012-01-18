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
#include "helper_plugin.h"
#include "helper_script_object.h"
#include "script_object_factory.h"

//extern Log g_Log;

NPError HelperPlugin::Init(NPP instance, uint16_t mode, int16_t argc,
                                   char* argn[],char* argv[], 
                                   NPSavedData* saved) {
  //g_Log.WriteLog("msg", "HelperPlugin Init");
  scriptobject_ = NULL;
  instance->pdata = this;
  return PluginBase::Init(instance, mode, argc, argn, argv, saved);
}

NPError HelperPlugin::UnInit(NPSavedData** save) {
  //g_Log.WriteLog("msg", "HelperPlugin UnInit");
  PluginBase::UnInit(save);
  scriptobject_ = NULL;
  return NPERR_NO_ERROR;
}

NPError HelperPlugin::GetValue(NPPVariable variable, void *value) {
  switch(variable) {
    case NPPVpluginScriptableNPObject:
      if (scriptobject_ == NULL) {
        scriptobject_ = ScriptObjectFactory::CreateObject(
            get_npp(), HelperScriptObject::Allocate);
        //g_Log.WriteLog("GetValue","HelperPlugin GetValue");
      }
      if (scriptobject_ != NULL) {
        *(NPObject**)value = scriptobject_;
      }
      else
        return NPERR_OUT_OF_MEMORY_ERROR;
      break;
    case NPPVpluginNeedsXEmbed:
      *(bool*)value = 1;
      break;
    default:
      return NPERR_GENERIC_ERROR;
  }

  return NPERR_NO_ERROR;
}

NPError HelperPlugin::SetWindow(NPWindow* window){
  PluginBase::SetWindow(window);
#ifdef  _DEBUG
  MessageBox(NULL, L"NPAPI", L"CHROME NPAPI", 0);
#endif

  return NPERR_NO_ERROR;
}
